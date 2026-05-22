autowatch = 0;
inlets = 1;
outlets = 1;

var GHQ_MAP = (function () {
  if (typeof require === "function" && typeof module !== "undefined" && module.exports !== undefined) {
    try {
      return require("./ghq_rack_map");
    } catch (error) {
      // Fall through to Max include.
    }
  }
  if (typeof include === "function") {
    include("ghq_rack_map.js");
    if (typeof ghq_rack_map !== "undefined") {
      return ghq_rack_map;
    }
  }
  throw new Error("ghq_rack_map.js is required");
}());

var bindings = {};
var scannedDevices = [];
var tunerState = { frequency: 0, note: "--", cents: 0, confidence: 0 };
var tunerDisplayEnabled = false;
var TUNER_EMIT_INTERVAL_MS = 100;
var TUNER_CENTS_DELTA = 4;
var TUNER_MIN_ANALYSIS_AMP = 0.02;
var TUNER_MEDIAN_WINDOW = 5;
var TUNER_NOTE_HOLD_SAMPLES = 3;
var TUNER_IDLE_HOLD_SAMPLES = 2;
var TUNER_FREQ_EMA_ALPHA = 0.28;
var TUNER_ATTACK_AMP_DELTA = 0.035;
var TUNER_ATTACK_HOLD_MS = 160;
var TUNER_ATTACK_JUMP_RATIO = 1.059;
var tunerLastEmitAt = 0;
var tunerFreqSamples = [];
var tunerFreqEma = 0;
var tunerDisplayedNote = "--";
var tunerPendingNote = "--";
var tunerPendingNoteCount = 0;
var tunerIdleHoldCount = 0;
var tunerLastConfidence = 0;
var tunerAttackHoldUntil = 0;
var TUNER_ANALYSIS_GAIN = 16;
var liveReady = false;
var pendingScan = false;
var lastState = {
  title: GHQ_MAP.title,
  scanned: false,
  status: "Not scanned",
  controls: {},
  boundCount: 0,
  totalCount: GHQ_MAP.controls.length
};

function postDebug(message) {
  if (typeof post === "function") {
    try {
      post("[ghq] " + message + "\n");
    } catch (error) {
      // Logging must not break the device.
    }
  }
}

function safeMessnamed() {
  if (typeof messnamed !== "function") {
    return;
  }
  try {
    messnamed.apply(this, arguments);
  } catch (error) {
    postDebug("messnamed failed: " + (error && error.message ? error.message : String(error || "unknown error")));
  }
}

function normalizeName(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function asArray(value) {
  if (value === undefined || value === null) {
    return [];
  }
  return value instanceof Array ? value : [value];
}

function liveAvailable() {
  return typeof LiveAPI === "function";
}

function apiFromId(id) {
  var api = new LiveAPI(function () {});

  if (id === undefined || id === null || id === "") {
    return null;
  }
  try {
    api.id = id;
  } catch (error) {
    try {
      api.path = "id " + id;
    } catch (pathError) {
      return null;
    }
  }
  return api;
}

function parseIds(raw) {
  var ids = [];
  var i;

  raw = raw || [];
  for (i = 0; i < raw.length; i += 1) {
    if (raw[i] === "id" && raw[i + 1] !== undefined) {
      ids.push(parseInt(raw[i + 1], 10));
      i += 1;
    } else if (typeof raw[i] === "number") {
      ids.push(raw[i]);
    }
  }
  return ids;
}

function getName(api) {
  var value;

  try {
    value = api.get("name");
    if (value instanceof Array) {
      return value.join(" ");
    }
    return String(value);
  } catch (error) {
    return "";
  }
}

function getStringProperty(api, propertyName) {
  var value;

  try {
    value = api.get(propertyName);
    if (value instanceof Array) {
      return value.join(" ");
    }
    return String(value || "");
  } catch (error) {
    return "";
  }
}

function deviceNames(api) {
  return [
    getName(api),
    getStringProperty(api, "class_display_name"),
    getStringProperty(api, "class_name")
  ];
}

function displayDeviceName(api) {
  var names = deviceNames(api);
  var i;

  for (i = 0; i < names.length; i += 1) {
    if (names[i]) {
      return names[i];
    }
  }
  return "";
}

function getNumeric(api, propertyName, fallback) {
  var value;

  try {
    value = api.get(propertyName);
    if (value instanceof Array) {
      value = value[0];
    }
    value = parseFloat(value);
    return isNaN(value) ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

function setNumeric(api, propertyName, value) {
  try {
    api.set(propertyName, value);
    return true;
  } catch (error) {
    return false;
  }
}

function namesMatch(actual, aliases) {
  var needle = normalizeName(actual);
  var list = asArray(aliases);
  var i;
  var alias;

  if (!needle) {
    return false;
  }
  for (i = 0; i < list.length; i += 1) {
    alias = normalizeName(list[i]);
    if (!alias) {
      continue;
    }
    if (needle === alias || needle.indexOf(alias) !== -1 || alias.indexOf(needle) !== -1) {
      return true;
    }
  }
  return false;
}

function apiId(api) {
  var id;

  if (!api) {
    return "";
  }
  try {
    id = api.id;
    if (id instanceof Array) {
      return String(id[id.length - 1]);
    }
    return String(id);
  } catch (error) {
    return "";
  }
}

function deviceCanHaveChains(api) {
  var names = deviceNames(api);
  var i;
  var normalized;

  for (i = 0; i < names.length; i += 1) {
    normalized = normalizeName(names[i]);
    if (
      normalized === "audioeffectgroupdevice" ||
      normalized === "midieffectgroupdevice" ||
      normalized === "instrumentgroupdevice" ||
      normalized.indexOf("rack") !== -1 ||
      normalized.indexOf("groupdevice") !== -1
    ) {
      return true;
    }
  }
  return false;
}

function childIds(api, propertyName) {
  if ((propertyName === "chains" || propertyName === "return_chains") && !deviceCanHaveChains(api)) {
    return [];
  }
  try {
    return parseIds(api.get(propertyName));
  } catch (error) {
    return [];
  }
}

function addDeviceTree(deviceApi, devices, seen) {
  var id = apiId(deviceApi);
  var chainIds;
  var deviceIds;
  var i;
  var j;
  var chainApi;
  var childDeviceApi;

  if (!deviceApi || !id || seen[id]) {
    return;
  }

  seen[id] = true;
  devices.push(deviceApi);

  chainIds = childIds(deviceApi, "chains").concat(childIds(deviceApi, "return_chains"));
  for (i = 0; i < chainIds.length; i += 1) {
    chainApi = apiFromId(chainIds[i]);
    deviceIds = chainApi ? childIds(chainApi, "devices") : [];
    for (j = 0; j < deviceIds.length; j += 1) {
      childDeviceApi = apiFromId(deviceIds[j]);
      addDeviceTree(childDeviceApi, devices, seen);
    }
  }
}

function collectDevices() {
  var thisDevice;
  var parentId;
  var parentApi;
  var deviceIds;
  var devices = [];
  var seen = {};
  var i;
  var api;

  if (!liveAvailable()) {
    return [];
  }

  try {
    thisDevice = new LiveAPI(function () {}, "this_device");
    parentId = parseIds(thisDevice.get("canonical_parent"))[0];
    parentApi = apiFromId(parentId);
    deviceIds = parentApi ? parseIds(parentApi.get("devices")) : [];
  } catch (error) {
    postDebug("Could not inspect sibling devices: " + error.message);
    return [];
  }

  for (i = 0; i < deviceIds.length; i += 1) {
    api = apiFromId(deviceIds[i]);
    addDeviceTree(api, devices, seen);
  }
  return devices;
}

function matchingDevices(aliases) {
  var matches = [];
  var i;
  var j;
  var api;
  var names;

  for (i = 0; i < scannedDevices.length; i += 1) {
    api = scannedDevices[i];
    names = api ? deviceNames(api) : [];
    for (j = 0; j < names.length; j += 1) {
      if (namesMatch(names[j], aliases)) {
        matches.push(api);
        break;
      }
    }
  }
  return matches;
}

function resolveTargetDevices(control) {
  var deviceAliases = GHQ_MAP.deviceAliases[control.deviceKey] || control.device || [];
  var devices = matchingDevices(deviceAliases);
  var index = control.deviceIndex;

  if (index !== undefined && index !== null) {
    index = parseInt(index, 10);
    if (!isNaN(index) && index >= 0) {
      return devices[index] ? [devices[index]] : [];
    }
  }
  if (control.match === "all") {
    return devices;
  }
  return devices.length ? [devices[0]] : [];
}

function firstParameter(deviceApi, aliases) {
  var ids;
  var i;
  var api;

  if (!deviceApi) {
    return null;
  }

  try {
    ids = parseIds(deviceApi.get("parameters"));
  } catch (error) {
    ids = [];
  }

  for (i = 0; i < ids.length; i += 1) {
    api = apiFromId(ids[i]);
    if (api && namesMatch(getName(api), aliases)) {
      return api;
    }
  }
  return null;
}

function deviceOnParameter(deviceApi) {
  return firstParameter(deviceApi, ["Device On", "On", "Active", "Bypass"]);
}

function parameterState(parameterApi) {
  var min = getNumeric(parameterApi, "min", 0);
  var max = getNumeric(parameterApi, "max", 1);
  var value = getNumeric(parameterApi, "value", 0);
  var normalized = max === min ? 0 : (value - min) / (max - min);

  return {
    value: value,
    min: min,
    max: max,
    normalized: Math.max(0, Math.min(1, normalized))
  };
}

function bindControl(control) {
  var useDevices = resolveTargetDevices(control);
  var targets = [];
  var parameterApi;
  var state;
  var i;

  for (i = 0; i < useDevices.length; i += 1) {
    if (control.kind === "device_toggle") {
      parameterApi = deviceOnParameter(useDevices[i]);
    } else {
      parameterApi = firstParameter(useDevices[i], control.parameter || []);
    }
    if (parameterApi) {
      targets.push({ device: useDevices[i], parameter: parameterApi });
    }
  }

  state = {
    id: control.id,
    label: control.label,
    kind: control.kind,
    section: control.section || "",
    detail: control.detail ? true : false,
    bound: targets.length > 0,
    deviceName: targetDeviceName(targets),
    parameterName: targets.length ? getName(targets[0].parameter) : "",
    targetCount: targets.length,
    normalized: 0,
    value: 0,
    active: false
  };

  if (targets.length) {
    applyTargetState(state, control, targets);
  }

  bindings[control.id] = {
    control: control,
    targets: targets
  };
  return state;
}

function targetDeviceName(targets) {
  if (!targets.length) {
    return "";
  }
  if (targets.length === 1) {
    return displayDeviceName(targets[0].device);
  }
  return displayDeviceName(targets[0].device) + " +" + (targets.length - 1);
}

function applyTargetState(state, control, targets) {
  var first = parameterState(targets[0].parameter);
  var active = false;
  var i;
  var targetState;

  mergeState(state, first);

  if (control.kind === "select") {
    state.active = Math.round(first.value) === control.value;
    return;
  }

  for (i = 0; i < targets.length; i += 1) {
    targetState = parameterState(targets[i].parameter);
    if (targetState.normalized >= 0.5) {
      active = true;
      break;
    }
  }
  state.active = active;
  if (targets.length > 1 && control.kind === "device_toggle") {
    state.normalized = active ? 1 : 0;
    state.value = active ? first.max : first.min;
  }
}

function mergeState(target, source) {
  var key;

  for (key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
  return target;
}

function emitState(status) {
  var controls = {};
  var boundCount = 0;
  var unmapped = [];
  var totalCount = 0;
  var i;
  var control;
  var binding;
  var state;

  for (i = 0; i < GHQ_MAP.controls.length; i += 1) {
    control = GHQ_MAP.controls[i];
    if (!control.optional) {
      totalCount += 1;
    }
    binding = bindings[control.id];
    if (!binding) {
      state = bindControl(control);
    } else if (binding.targets && binding.targets.length) {
      state = {
        id: control.id,
        label: control.label,
        kind: control.kind,
        section: control.section || "",
        detail: control.detail ? true : false,
        bound: true,
        deviceName: targetDeviceName(binding.targets),
        parameterName: getName(binding.targets[0].parameter),
        targetCount: binding.targets.length
      };
      applyTargetState(state, control, binding.targets);
    } else {
      state = {
        id: control.id,
        label: control.label,
        kind: control.kind,
        section: control.section || "",
        detail: control.detail ? true : false,
        bound: false,
        normalized: 0,
        value: 0,
        active: false
      };
    }
    if (state.bound && !control.optional) {
      boundCount += 1;
    } else if (!state.bound && !control.optional) {
      unmapped.push(control.id);
    }
    controls[control.id] = state;
  }

  lastState = {
    title: GHQ_MAP.title,
    scanned: true,
    status: status || (boundCount ? "Ready" : "No rack devices found on this track"),
    controls: controls,
    boundCount: boundCount,
    totalCount: totalCount,
    unmapped: unmapped
  };

  safeMessnamed("ghq_engine_events", "rack_state", JSON.stringify(lastState));
  syncTunerDisplayEnabled();
  if (tunerDisplayEnabled) {
    safeMessnamed("ghq_engine_events", "tuner_state", JSON.stringify(tunerState));
  }
}

function controlViewState(control, binding, normalized, value) {
  var state = {
    id: control.id,
    label: control.label,
    kind: control.kind,
    section: control.section || "",
    detail: control.detail ? true : false,
    bound: !!(binding && binding.targets && binding.targets.length),
    deviceName: binding && binding.targets ? targetDeviceName(binding.targets) : "",
    parameterName: binding && binding.targets && binding.targets.length ? getName(binding.targets[0].parameter) : "",
    targetCount: binding && binding.targets ? binding.targets.length : 0,
    normalized: Math.max(0, Math.min(1, parseFloat(normalized) || 0)),
    value: value === undefined ? 0 : value,
    active: false
  };

  state.active = control.kind === "select"
    ? Math.round(state.value) === control.value
    : state.normalized >= 0.5;

  return state;
}

function emitControlState(control, binding, normalized, value, status) {
  var state = controlViewState(control, binding, normalized, value);
  var payload = {
    id: control.id,
    status: status || "",
    state: state
  };

  safeMessnamed("ghq_engine_events", "control_state", JSON.stringify(payload));
}

function publishTunerAnalysisGain() {
  safeMessnamed("ghq_tuner_analysis_gain", TUNER_ANALYSIS_GAIN);
}

function idleTunerState() {
  return { frequency: 0, note: "--", cents: 0, confidence: 0 };
}

function resetTunerSmoothing() {
  tunerFreqSamples = [];
  tunerFreqEma = 0;
  tunerDisplayedNote = "--";
  tunerPendingNote = "--";
  tunerPendingNoteCount = 0;
  tunerIdleHoldCount = 0;
  tunerLastConfidence = 0;
  tunerAttackHoldUntil = 0;
}

function isTunerAttackHoldActive() {
  return Date.now() < tunerAttackHoldUntil;
}

function beginTunerAttackHold() {
  tunerAttackHoldUntil = Date.now() + TUNER_ATTACK_HOLD_MS;
  tunerPendingNoteCount = 0;
}

function isTunerNoteChange(rawFrequency) {
  var candidate;

  if (rawFrequency <= 0 || tunerDisplayedNote === "--") {
    return false;
  }
  candidate = noteNameFromFrequency(rawFrequency).note;
  return candidate !== "--" && candidate !== tunerDisplayedNote;
}

function prepareTunerNoteChange(rawFrequency) {
  var candidate;

  tunerAttackHoldUntil = 0;
  tunerFreqSamples = [];
  tunerFreqEma = rawFrequency;
  candidate = noteNameFromFrequency(rawFrequency).note;
  tunerPendingNote = candidate;
  tunerPendingNoteCount = TUNER_NOTE_HOLD_SAMPLES;
  if (candidate !== "--") {
    tunerDisplayedNote = candidate;
  }
}

function updateTunerAttackHold(rawFrequency, confidence) {
  var ampRise;
  var ratio;

  if (isTunerAttackHoldActive()) {
    return true;
  }

  ampRise = confidence - tunerLastConfidence;
  tunerLastConfidence = confidence;

  if (tunerDisplayedNote === "--" || tunerFreqEma <= 0) {
    return false;
  }

  if (isTunerNoteChange(rawFrequency)) {
    return false;
  }

  if (confidence >= TUNER_MIN_ANALYSIS_AMP && ampRise >= TUNER_ATTACK_AMP_DELTA) {
    beginTunerAttackHold();
    return true;
  }

  if (tunerFreqEma > 0 && rawFrequency > 0) {
    ratio = rawFrequency / tunerFreqEma;
    if (ratio > TUNER_ATTACK_JUMP_RATIO || ratio < 1 / TUNER_ATTACK_JUMP_RATIO) {
      beginTunerAttackHold();
      return true;
    }
  }

  return false;
}

function isWildTunerFrequencySample(frequency) {
  var ratio;

  if (frequency <= 0 || tunerFreqEma <= 0) {
    return false;
  }
  if (isTunerNoteChange(frequency)) {
    return false;
  }
  ratio = frequency / tunerFreqEma;
  return ratio > TUNER_ATTACK_JUMP_RATIO || ratio < 1 / TUNER_ATTACK_JUMP_RATIO;
}

function clearTunerDisplay() {
  tunerState = idleTunerState();
  tunerLastEmitAt = 0;
  resetTunerSmoothing();
  safeMessnamed("ghq_engine_events", "tuner_state", JSON.stringify(tunerState));
}

function syncTunerDisplayEnabled() {
  var controlState = lastState.controls && lastState.controls.tuner_on;
  var enabled = !!(controlState && controlState.bound && controlState.normalized >= 0.5);

  tunerDisplayEnabled = enabled;
  if (!enabled) {
    if (tunerState.frequency > 0 || tunerState.note !== "--") {
      clearTunerDisplay();
    }
    return;
  }
  publishTunerAnalysisGain();
}

function noteNameFromFrequency(frequency) {
  var names = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  var midi;
  var rounded;

  frequency = parseFloat(frequency);
  if (!frequency || frequency <= 0) {
    return { note: "--", cents: 0 };
  }
  midi = 69 + 12 * Math.log(frequency / 440) / Math.log(2);
  rounded = Math.round(midi);
  return {
    note: names[((rounded % 12) + 12) % 12],
    cents: Math.max(-50, Math.min(50, Math.round((midi - rounded) * 100)))
  };
}

function medianFrequency(samples) {
  var sorted;
  var mid;

  if (!samples.length) {
    return 0;
  }
  sorted = samples.slice().sort(function (a, b) {
    return a - b;
  });
  mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function pushTunerFrequencySample(frequency) {
  if (frequency <= 0) {
    return 0;
  }
  if (isWildTunerFrequencySample(frequency)) {
    if (tunerFreqSamples.length) {
      return medianFrequency(tunerFreqSamples);
    }
    return tunerFreqEma > 0 ? tunerFreqEma : frequency;
  }
  tunerFreqSamples.push(frequency);
  if (tunerFreqSamples.length > TUNER_MEDIAN_WINDOW) {
    tunerFreqSamples.shift();
  }
  return medianFrequency(tunerFreqSamples);
}

function smoothTunerFrequency(medianFrequency) {
  if (medianFrequency <= 0) {
    tunerFreqEma = 0;
    return 0;
  }
  if (tunerFreqEma <= 0) {
    tunerFreqEma = medianFrequency;
  } else {
    tunerFreqEma = tunerFreqEma * (1 - TUNER_FREQ_EMA_ALPHA) + medianFrequency * TUNER_FREQ_EMA_ALPHA;
  }
  return tunerFreqEma;
}

function centsForDisplayedNote(frequency, displayNote) {
  var names = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  var midi;
  var nearestMidi;
  var nearestClass;
  var noteIndex = -1;
  var diff;
  var targetMidi;
  var i;

  if (!frequency || frequency <= 0 || displayNote === "--") {
    return 0;
  }

  for (i = 0; i < names.length; i += 1) {
    if (names[i] === displayNote) {
      noteIndex = i;
      break;
    }
  }
  if (noteIndex < 0) {
    return noteNameFromFrequency(frequency).cents;
  }

  midi = 69 + 12 * Math.log(frequency / 440) / Math.log(2);
  nearestMidi = Math.round(midi);
  nearestClass = ((nearestMidi % 12) + 12) % 12;
  diff = noteIndex - nearestClass;
  targetMidi = nearestMidi + diff;
  if (diff > 6) {
    targetMidi -= 12;
  } else if (diff < -6) {
    targetMidi += 12;
  }
  return Math.max(-50, Math.min(50, Math.round((midi - targetMidi) * 100)));
}

function stableTunerNote(frequency) {
  var detected = noteNameFromFrequency(frequency);
  var candidate = detected.note;

  if (candidate === "--") {
    tunerPendingNote = "--";
    tunerPendingNoteCount = 0;
    tunerDisplayedNote = "--";
    return "--";
  }

  if (candidate === tunerDisplayedNote) {
    tunerPendingNote = candidate;
    tunerPendingNoteCount = 0;
    return tunerDisplayedNote;
  }

  if (candidate === tunerPendingNote) {
    tunerPendingNoteCount += 1;
  } else {
    tunerPendingNote = candidate;
    tunerPendingNoteCount = 1;
  }

  if (tunerPendingNoteCount >= TUNER_NOTE_HOLD_SAMPLES) {
    tunerDisplayedNote = tunerPendingNote;
  }

  return tunerDisplayedNote;
}

function buildSmoothedTunerReading(rawFrequency, confidence) {
  var medianFreq;
  var smoothFreq;
  var displayNote;
  var cents;

  if (rawFrequency <= 0) {
    tunerIdleHoldCount += 1;
    if (tunerIdleHoldCount < TUNER_IDLE_HOLD_SAMPLES) {
      return null;
    }
    resetTunerSmoothing();
    return idleTunerState();
  }

  tunerIdleHoldCount = 0;
  if (isTunerNoteChange(rawFrequency)) {
    prepareTunerNoteChange(rawFrequency);
  } else if (updateTunerAttackHold(rawFrequency, confidence)) {
    return null;
  }
  medianFreq = pushTunerFrequencySample(rawFrequency);
  smoothFreq = smoothTunerFrequency(medianFreq);
  displayNote = stableTunerNote(smoothFreq);
  cents = centsForDisplayedNote(smoothFreq, displayNote);

  return {
    frequency: smoothFreq,
    note: displayNote,
    cents: cents,
    confidence: confidence
  };
}

function shouldEmitTunerState(next) {
  var now = Date.now();
  var noteChanged = next.note !== tunerState.note;
  var wasIdle = tunerState.frequency <= 0 || tunerState.note === "--";
  var isIdle = next.frequency <= 0 || next.note === "--";
  var centsDelta = Math.abs(next.cents - tunerState.cents);

  if (wasIdle !== isIdle || noteChanged) {
    return true;
  }
  if (isIdle) {
    return false;
  }
  if (centsDelta >= TUNER_CENTS_DELTA) {
    return true;
  }
  return now - tunerLastEmitAt >= TUNER_EMIT_INTERVAL_MS;
}

function tuner_frequency(frequency, confidence) {
  var next;

  if (!tunerDisplayEnabled) {
    return;
  }

  frequency = parseFloat(frequency) || 0;
  confidence = parseFloat(confidence) || 0;
  if (confidence < TUNER_MIN_ANALYSIS_AMP) {
    frequency = 0;
  }

  next = buildSmoothedTunerReading(frequency, confidence);
  if (!next) {
    return;
  }

  if (next.note !== tunerState.note || shouldEmitTunerState(next)) {
    tunerState = next;
    tunerLastEmitAt = Date.now();
    safeMessnamed("ghq_engine_events", "tuner_state", JSON.stringify(tunerState));
  }
}

function scan() {
  var i;

  if (!liveReady) {
    liveReady = true;
  }

  bindings = {};
  scannedDevices = collectDevices();
  if (!liveAvailable()) {
    emitState("LiveAPI unavailable");
    return;
  }
  for (i = 0; i < GHQ_MAP.controls.length; i += 1) {
    bindControl(GHQ_MAP.controls[i]);
  }
  publishTunerAnalysisGain();
  emitState("Scanned");
}

function setControl(controlId, normalized) {
  var binding = bindings[controlId];
  var state;
  var value;
  var firstValue = 0;
  var i;

  if (!binding || !binding.targets || !binding.targets.length) {
    emitState("Unmapped: place next to 2026 Guitar Rack");
    return;
  }

  normalized = Math.max(0, Math.min(1, parseFloat(normalized)));
  if (isNaN(normalized)) {
    normalized = 0;
  }
  for (i = 0; i < binding.targets.length; i += 1) {
    state = parameterState(binding.targets[i].parameter);
    value = state.min + normalized * (state.max - state.min);
    if (i === 0) {
      firstValue = value;
    }
    setNumeric(binding.targets[i].parameter, "value", value);
  }
  emitControlState(binding.control, binding, normalized, firstValue, "Set " + binding.control.label);
}

function triggerControl(controlId) {
  var binding = bindings[controlId];
  var state;
  var value;
  var active = false;
  var i;

  if (!binding || !binding.targets || !binding.targets.length) {
    emitState("Unmapped: place next to 2026 Guitar Rack");
    return;
  }

  if (binding.control.kind === "select") {
    value = binding.control.value;
    for (i = 0; i < binding.targets.length; i += 1) {
      setNumeric(binding.targets[i].parameter, "value", value);
    }
  } else {
    for (i = 0; i < binding.targets.length; i += 1) {
      state = parameterState(binding.targets[i].parameter);
      if (state.normalized >= 0.5) {
        active = true;
        break;
      }
    }
    for (i = 0; i < binding.targets.length; i += 1) {
      state = parameterState(binding.targets[i].parameter);
      value = active ? state.min : state.max;
      setNumeric(binding.targets[i].parameter, "value", value);
    }
  }
  emitState(binding.control.label);
}

function all_off() {
  var i;
  var control;
  var binding;
  var state;
  var j;

  for (i = 0; i < GHQ_MAP.controls.length; i += 1) {
    control = GHQ_MAP.controls[i];
    if (control.kind !== "device_toggle") {
      continue;
    }
    binding = bindings[control.id];
    if (!binding || !binding.targets || !binding.targets.length) {
      continue;
    }
    for (j = 0; j < binding.targets.length; j += 1) {
      state = parameterState(binding.targets[j].parameter);
      setNumeric(binding.targets[j].parameter, "value", state.min);
    }
  }
  emitState("Devices off");
}

function set_control(controlId, normalized) {
  setControl(controlId, normalized);
}

function trigger_control(controlId) {
  triggerControl(controlId);
}

function init() {
  pendingScan = true;
  if (liveReady) {
    scan();
  }
}

function loadbang() {
  init();
}

function live_ready() {
  liveReady = true;
  if (pendingScan) {
    pendingScan = false;
    scan();
  }
}

function anything() {
  var args = arrayfromargs(arguments);

  if (messagename === "set_control") {
    setControl(args[0], args[1]);
  } else if (messagename === "trigger_control") {
    triggerControl(args[0]);
  } else if (messagename === "all_off") {
    all_off();
  } else if (messagename === "scan") {
    scan();
  } else if (messagename === "tuner_frequency") {
    tuner_frequency(args[0], args[1]);
  }
}
