autowatch = 0;
inlets = 1;
outlets = 1;

include("ghq_ui_shared.js");
include("ghq_rack_map.js");

mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

var WIDTH = 980;
var HEIGHT = 176;
var colors = ghq_shared.colors;
var hitZones = [];
var sliderSendCache = {};
var SLIDER_SEND_INTERVAL_MS = 16;
var SLIDER_SEND_DELTA = 0.0025;
var rackState = {
  title: ghq_rack_map.title,
  scanned: false,
  status: "Not scanned",
  controls: {}
};

function controlState(id) {
  return rackState.controls[id] || { bound: false, normalized: 0, value: 0 };
}

function applySize() {
  if (typeof box !== "undefined" && box) {
    try {
      if (typeof box.size === "function") {
        box.size(WIDTH, HEIGHT);
      }
      if (box.presentation_rect !== undefined) {
        box.presentation_rect = [0, 0, WIDTH, HEIGHT];
      }
    } catch (error) {
      // Keep UI usable in older Max runtimes.
    }
  }
}

function paint() {
  hitZones = [];
  ghq_shared.rect(0, 0, WIDTH, HEIGHT, colors.bg);
  drawHeader();
  drawInput();
  drawAmpSims();
  drawCore();
  drawEffects();
}

function drawHeader() {
  var bound = rackState.boundCount || 0;
  var total = rackState.totalCount || ghq_rack_map.controls.length;
  var missing = rackState.unmapped && rackState.unmapped.length ? rackState.unmapped[0] : "";

  ghq_shared.rect(0, 0, 136, HEIGHT, colors.panel2);
  ghq_shared.text(rackState.title || "Guitar HQ", 14, 26, 17, colors.text);
  ghq_shared.text(bound + "/" + total + " mapped", 14, 50, 11, bound === total ? colors.green : colors.amber);
  ghq_shared.text(missing ? "Missing: " + missing : rackState.status || "", 14, 70, 10, missing ? colors.red : colors.muted);
  ghq_shared.button(hitZones, "edit", "Edit", 14, 108, 48, 24, true, { action: "edit" });
  ghq_shared.button(hitZones, "scan", "Scan", 14, 138, 48, 24, false, { action: "scan" });
  ghq_shared.button(hitZones, "panic", "Off", 72, 138, 48, 24, false, { action: "panic" });
}

function drawInput() {
  var x = 152;

  ghq_shared.text("Utility", x, 24, 13, colors.text);
  ghq_shared.slider(hitZones, "utility_width", "Width", controlState("utility_width").normalized, x, 48, 98, 22, {
    action: "set",
    controlId: "utility_width"
  });
  ghq_shared.slider(hitZones, "utility_gain", "Gain", controlState("utility_gain").normalized, x, 98, 98, 22, {
    action: "set",
    controlId: "utility_gain"
  });
  ghq_shared.button(hitZones, "utility_mono", "Mono", x, 136, 58, 24, controlState("utility_mono").normalized >= 0.5, {
    action: "trigger",
    controlId: "utility_mono"
  });
}

function drawAmpSims() {
  var x = 276;
  var y = 48;
  var ids = ["amp_dry", "amp_bassman", "amp_dumble"];
  var labels = ["Dry", "Bassman", "Dumble"];
  var i;
  var state;
  var active;

  ghq_shared.text("Amp Sims", x, 24, 13, colors.text);
  for (i = 0; i < ids.length; i += 1) {
    state = controlState(ids[i]);
    active = state.active || state.normalized > 0.45;
    ghq_shared.button(hitZones, ids[i], labels[i], x, y + i * 34, 118, 26, active, {
      action: "trigger",
      controlId: ids[i]
    });
  }
}

function drawCore() {
  var x = 424;
  var y = 48;
  var controls = [
    ["satur_on", "Saturn"],
    ["nam_on", "Faceman"],
    ["cab_on", "Cab"]
  ];
  var i;
  var id;

  ghq_shared.text("Core", x, 24, 13, colors.text);
  for (i = 0; i < controls.length; i += 1) {
    id = controls[i][0];
    ghq_shared.button(hitZones, id, controls[i][1], x, y + i * 34, 78, 26, controlState(id).normalized >= 0.5, {
      action: "trigger",
      controlId: id
    });
  }
  ghq_shared.button(hitZones, "tuner_on", "Tuner", x + 92, 48, 78, 94, controlState("tuner_on").normalized >= 0.5, {
    action: "trigger",
    controlId: "tuner_on"
  });
}

function drawEffects() {
  var x = 624;
  var y = 42;
  var w = 106;
  var h = 24;
  var gap = 8;
  var controls = [
    ["delay_on", "Delay"],
    ["supermassive_on", "Supermassive"],
    ["spaceblender_on", "SpaceBlend"],
    ["spring_on", "Spring"],
    ["chorus_on", "Chorus"],
    ["flanger_on", "Flanger"],
    ["phase_on", "Phase"],
    ["plate_on", "Plate"],
    ["mixbox_on", "MixBox"]
  ];
  var i;
  var col;
  var row;
  var id;

  ghq_shared.text("Time / Mod / Verb", x, 24, 13, colors.text);
  for (i = 0; i < controls.length; i += 1) {
    col = i % 3;
    row = Math.floor(i / 3);
    id = controls[i][0];
    ghq_shared.button(hitZones, id, controls[i][1], x + col * (w + gap), y + row * 36, w, h, controlState(id).normalized >= 0.5, {
      action: "trigger",
      controlId: id
    });
  }
}

function send() {
  var args = arrayfromargs(arguments);
  outlet.apply(this, [0].concat(args));
}

function init() {
  applySize();
  mgraphics.redraw();
}

function loadbang() {
  init();
}

function rack_state(json) {
  if (typeof json !== "string") {
    json = arrayfromargs(arguments).join(" ");
  }
  try {
    rackState = JSON.parse(json);
  } catch (error) {
    rackState.status = "State parse failed";
  }
  mgraphics.redraw();
}

function updateSlider(zone, x) {
  var normalized = ghq_shared.clamp((x - zone.x) / zone.w, 0, 1);
  var id = zone.data.controlId;
  var now = Date.now();
  var cached = sliderSendCache[id] || { at: 0, value: -1 };

  if (Math.abs(normalized - cached.value) < SLIDER_SEND_DELTA && now - cached.at < SLIDER_SEND_INTERVAL_MS) {
    return;
  }
  sliderSendCache[id] = { at: now, value: normalized };
  if (rackState.controls[id]) {
    rackState.controls[id].normalized = normalized;
    rackState.controls[id].active = normalized >= 0.5;
    mgraphics.redraw();
  }
  send("set_control", zone.data.controlId, normalized);
}

function control_state(json) {
  var payload;

  if (typeof json !== "string") {
    json = arrayfromargs(arguments).join(" ");
  }
  try {
    payload = JSON.parse(json);
    if (payload && payload.id && payload.state) {
      rackState.controls[payload.id] = payload.state;
      if (payload.status) {
        rackState.status = payload.status;
      }
    }
  } catch (error) {
    rackState.status = "Control state parse failed";
  }
  mgraphics.redraw();
}

function onclick(x, y) {
  var zone = ghq_shared.findZone(hitZones, x, y);

  if (!zone) {
    return;
  }
  if (zone.data.action === "scan") {
    send("scan");
  } else if (zone.data.action === "edit") {
    send("open_editor");
  } else if (zone.data.action === "panic") {
    send("all_off");
  } else if (zone.data.action === "trigger") {
    send("trigger_control", zone.data.controlId);
  } else if (zone.data.action === "set") {
    updateSlider(zone, x);
  }
}

function ondrag(x, y) {
  var zone = ghq_shared.findZone(hitZones, x, y);

  if (zone && zone.data.action === "set") {
    updateSlider(zone, x);
  }
}

function anything() {
  if (messagename === "rack_state") {
    rack_state.apply(this, arrayfromargs(arguments));
  } else if (messagename === "control_state") {
    control_state.apply(this, arrayfromargs(arguments));
  }
}
