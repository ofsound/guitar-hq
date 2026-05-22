autowatch = 0;
inlets = 1;
outlets = 1;

include("ghq_ui_shared.js");
include("ghq_rack_map.js");

mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

var WIDTH = 1080;
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

function drawAmpSims() {
  var x = 152;
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

function ampChainPlugins(chain) {
  if (chain === "bassman") {
    return [
      ["satur_on", "Saturn"],
      ["nam_on", "Faceman"],
      ["cab_on", "Cab"]
    ];
  }
  if (chain === "dumble") {
    return [
      ["overdrive_on", "ODS"],
      ["cab_dumble_on", "Cab"]
    ];
  }
  return [];
}

function drawAmpChainColumn(chain, x, y, pluginW, pluginGap) {
  var plugins = ampChainPlugins(chain);
  var heading = chain === "bassman" ? "Bassman" : "Dumble";
  var i;
  var id;

  ghq_shared.text(heading, x, 24, 13, colors.text);
  for (i = 0; i < plugins.length; i += 1) {
    id = plugins[i][0];
    ghq_shared.button(hitZones, id, plugins[i][1], x, y + i * pluginGap, pluginW, 26, controlState(id).normalized >= 0.5, {
      action: "trigger",
      controlId: id
    });
  }
  return x + pluginW + 14;
}

function drawCore() {
  var x = 300;
  var y = 48;
  var chains = ghq_shared.activeAmpChains(rackState.controls);
  var pluginW = 78;
  var pluginGap = 34;
  var tunerX = x;
  var i;

  for (i = 0; i < chains.length; i += 1) {
    tunerX = drawAmpChainColumn(chains[i], x, y, pluginW, pluginGap);
    x = tunerX;
  }
  ghq_shared.button(hitZones, "tuner_on", "Tuner", tunerX, 48, 78, 94, controlState("tuner_on").normalized >= 0.5, {
    action: "trigger",
    controlId: "tuner_on"
  });
}

function drawEffects() {
  var x = 580;
  var y = 42;
  var w = 106;
  var h = 24;
  var gap = 8;
  var controls = [
    ["delay_on", "Delay"],
    ["supermassive_on", "Supermassive"],
    ["spaceblender_on", "SpaceBlend"],
    ["spring_tremolo_on", "Spr Trem"],
    ["spring_reverb_on", "Spr Verb"],
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

function setSliderNormalized(zone, normalized) {
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

function updateSlider(zone, x) {
  setSliderNormalized(zone, ghq_shared.clamp((x - zone.x) / zone.w, 0, 1));
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

function onwheel(x, y, scrollx, scrolly, mod1, shift, caps, opt, mod2) {
  var zone = ghq_shared.findZone(hitZones, x, y);
  var state;
  var normalized;

  if (!zone || zone.data.action !== "set") {
    return;
  }
  state = controlState(zone.data.controlId);
  normalized = ghq_shared.clamp((state.normalized || 0) + ghq_shared.wheelNudge(scrolly, shift), 0, 1);
  setSliderNormalized(zone, normalized);
}

function anything() {
  if (messagename === "rack_state") {
    rack_state.apply(this, arrayfromargs(arguments));
  } else if (messagename === "control_state") {
    control_state.apply(this, arrayfromargs(arguments));
  }
}
