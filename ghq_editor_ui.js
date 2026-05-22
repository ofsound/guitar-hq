autowatch = 0;
inlets = 1;
outlets = 1;

include("ghq_ui_shared.js");
include("ghq_rack_map.js");

mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

var DETAIL_COL_X = 24;
var DETAIL_SLIDER_W = 164;
var DETAIL_COL_GAP = 24;
var DETAIL_COL_PITCH = DETAIL_SLIDER_W + DETAIL_COL_GAP;
var DETAIL_COL_COUNT = 9;
var DETAIL_COL_Y = 300;
var DETAIL_ROW_PITCH = 52;
var DETAIL_LABEL_H = 14;
var DETAIL_CONTROL_H = 24;
var DETAIL_TOGGLE_FONT = 13;
var AMP_COL_W = 150;
var AMP_CONTROL_H = 30;
var AMP_ROW_PITCH = 38;
var AMP_COL_GAP = 24;
var EDITOR_RIGHT_MARGIN = 62;
// Detail columns (incl. SuperPlate) + gap + MixBox column + margin. Keep in sync with build-device-patch.js EDITOR_WIDTH.
var WIDTH =
  DETAIL_COL_X +
  (DETAIL_COL_COUNT - 1) * DETAIL_COL_PITCH +
  DETAIL_SLIDER_W +
  DETAIL_COL_GAP +
  AMP_COL_W +
  EDITOR_RIGHT_MARGIN;
var HEIGHT = 740;
var colors = ghq_shared.colors;
var hitZones = [];
var rackState = {
  title: ghq_rack_map.title,
  scanned: false,
  status: "Not scanned",
  controls: {}
};
var tuner = {
  frequency: 0,
  note: "--",
  cents: 0,
  confidence: 0
};
var sliderSendCache = {};
var SLIDER_SEND_INTERVAL_MS = 16;
var SLIDER_SEND_DELTA = 0.0025;

function controlState(id) {
  return rackState.controls[id] || { bound: false, normalized: 0, value: 0, active: false };
}

function send() {
  var args = arrayfromargs(arguments);
  outlet.apply(this, [0].concat(args));
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
      // Keep the editor usable even if Max refuses a resize message.
    }
  }
}

function init() {
  applySize();
  mgraphics.redraw();
}

function loadbang() {
  init();
}

function paint() {
  hitZones = [];
  ghq_shared.rect(0, 0, WIDTH, HEIGHT, colors.bg);
  drawHeader();
  drawTuner();
  drawAmpAndCore();
  drawDetailSliders();
}

function drawHeader() {
  var bound = rackState.boundCount || 0;
  var total = rackState.totalCount || ghq_rack_map.controls.length;
  var missing = rackState.unmapped && rackState.unmapped.length ? rackState.unmapped.join(", ") : "";

  ghq_shared.text("Guitar HQ", 24, 40, 24, colors.text);
  ghq_shared.text(bound + "/" + total + " mapped", 24, 66, 12, bound === total ? colors.green : colors.amber);
  ghq_shared.text(missing ? "Missing: " + missing : rackState.status || "", 24, 88, 12, missing ? colors.red : colors.muted);
  ghq_shared.button(hitZones, "scan", "Scan", 24, 112, 70, 28, false, { action: "scan" });
  ghq_shared.button(hitZones, "all_off", "All Off", 106, 112, 82, 28, false, { action: "panic" });
}

function drawTuner() {
  var x = 230;
  var y = 28;
  var w = 390;
  var h = 180;
  var cx = x + w / 2;
  var needleX = cx + ghq_shared.clamp(tuner.cents, -50, 50) / 50 * (w / 2 - 34);
  var note = tuner.note || "--";
  var hz = tuner.frequency > 0 ? tuner.frequency.toFixed(1) + " Hz" : "No pitch";

  ghq_shared.rect(x, y, w, h, colors.panel2);
  ghq_shared.strokeRect(x, y, w, h, colors.softStroke, 1);
  ghq_shared.text("Tuner", x + 18, y + 28, 15, colors.text);
  ghq_shared.text(note, cx, y + 96, 54, tuner.frequency > 0 ? colors.text : colors.muted, "center");
  ghq_shared.text(hz, cx, y + 128, 14, colors.muted, "center");
  ghq_shared.rect(x + 34, y + 150, w - 68, 4, colors.off);
  ghq_shared.rect(cx - 1, y + 142, 2, 20, colors.green);
  ghq_shared.rect(needleX - 2, y + 136, 4, 32, Math.abs(tuner.cents) < 5 ? colors.green : colors.amber);
  ghq_shared.text("-50", x + 34, y + 176, 10, colors.muted);
  ghq_shared.text("+50", x + w - 34, y + 176, 10, colors.muted, "right");
  ghq_shared.button(hitZones, "tuner_on", "Tuner On", x + w - 102, y + 18, 82, 24, controlState("tuner_on").normalized >= 0.5, {
    action: "trigger",
    controlId: "tuner_on"
  });
}

function ampChainPlugins(chain) {
  if (chain === "bassman") {
    return [
      ["satur_on", "Saturn 2"],
      ["nam_on", "NA Faceman"],
      ["cab_on", "Cab IRs"]
    ];
  }
  if (chain === "dumble") {
    return [
      ["overdrive_on", "NA Overdrive Special"],
      ["cab_dumble_on", "Cab IRs"]
    ];
  }
  return [];
}

function drawPluginColumn(heading, colX, y, plugins, controlStartY) {
  var i;
  var id;
  var rowY = controlStartY !== undefined ? controlStartY : y + 44;

  if (heading) {
    ghq_shared.text(heading, colX, y + 24, 15, colors.text);
  }
  for (i = 0; i < plugins.length; i += 1) {
    id = plugins[i][0];
    ghq_shared.button(hitZones, id, plugins[i][1], colX, rowY + i * AMP_ROW_PITCH, AMP_COL_W, AMP_CONTROL_H, controlState(id).normalized >= 0.5, {
      action: "trigger",
      controlId: id
    });
  }
  return colX + AMP_COL_W + AMP_COL_GAP;
}

function mixBoxPlugins() {
  return [
    ["mixbox_slot1_on", "Black 76"],
    ["mixbox_slot2_on", "Model 670"],
    ["mixbox_slot3_on", "White 2A"],
    ["mixbox_slot4_on", "Bus Compressor"],
    ["mixbox_slot5_on", "EQ PA"],
    ["mixbox_slot6_on", "EQ 81"],
    ["mixbox_slot7_on", "British EQ"],
    ["mixbox_slot8_on", "Vintage EQ-1A"]
  ];
}

function drawAmpChainColumn(chain, colX, y) {
  var heading = chain === "bassman" ? "Bassman" : "Dumble";

  return drawPluginColumn(heading, colX, y, ampChainPlugins(chain));
}

function drawAmpAndCore() {
  var x = 660;
  var y = 28;
  var toggleW = 68;
  var faderX = x + toggleW + AMP_COL_GAP;
  var colX = faderX + AMP_COL_W + AMP_COL_GAP;
  var toggleIds = ["amp_dry", "amp_bassman", "amp_dumble"];
  var volIds = ["amp_dry_vol", "amp_bassman_vol", "amp_dumble_vol"];
  var labels = ["Dry", "Bassman", "Dumble"];
  var chains = ghq_shared.activeAmpChains(rackState.controls);
  var i;
  var id;
  var vol;
  var rowY;

  ghq_shared.text("Amp Sims", x, y + 24, 15, colors.text);
  for (i = 0; i < toggleIds.length; i += 1) {
    id = toggleIds[i];
    vol = controlState(volIds[i]);
    rowY = y + 44 + i * AMP_ROW_PITCH;
    ghq_shared.button(hitZones, id, labels[i], x, rowY, toggleW, AMP_CONTROL_H, controlState(id).active, {
      action: "trigger",
      controlId: id
    });
    ghq_shared.slider(hitZones, volIds[i], "", vol.normalized || 0, faderX, rowY, AMP_COL_W, AMP_CONTROL_H, {
      action: "set",
      controlId: volIds[i]
    }, vol.valueLabel || "");
  }

  for (i = 0; i < chains.length; i += 1) {
    colX = drawAmpChainColumn(chains[i], colX, y);
  }
}

function detailCol(index) {
  return DETAIL_COL_X + index * DETAIL_COL_PITCH;
}

function drawDetailSliders() {
  drawSection(detailCol(0), DETAIL_COL_Y, [
    "delay_on",
    "delay_mix",
    "delay_l_ms",
    "delay_feedback"
  ]);
  drawSection(detailCol(1), DETAIL_COL_Y, [
    "supermassive_on",
    "supermassive_mix",
    "supermassive_feedback"
  ]);
  drawSection(detailCol(2), DETAIL_COL_Y, [
    "spaceblender_on",
    "spaceblender_time",
    "spaceblender_color",
    "spaceblender_texture",
    "spaceblender_mod",
    "spaceblender_mix"
  ]);
  drawSection(detailCol(3), DETAIL_COL_Y, [
    "spring_reverb_on",
    "spring_reverb_mix",
    "spring_reverb_decay"
  ]);
  drawSection(detailCol(4), DETAIL_COL_Y, [
    "spring_tremolo_on",
    "spring_tremolo_intensity",
    "spring_tremolo_speed"
  ]);
  drawSection(detailCol(5), DETAIL_COL_Y, [
    "chorus_on",
    "chorus_amount"
  ]);
  drawSection(detailCol(6), DETAIL_COL_Y, [
    "flanger_on",
    "flanger_amount"
  ]);
  drawSection(detailCol(7), DETAIL_COL_Y, [
    "phase_on",
    "phase_mix"
  ]);
  drawSection(detailCol(8), DETAIL_COL_Y, [
    "plate_on",
    "plate_mix"
  ]);
  drawPluginColumn(
    null,
    detailCol(8) + DETAIL_SLIDER_W + DETAIL_COL_GAP,
    DETAIL_COL_Y,
    mixBoxPlugins(),
    DETAIL_COL_Y + DETAIL_LABEL_H
  );
}

function drawSection(x, y, ids) {
  var i;
  var id;
  var c;
  var cy;

  for (i = 0; i < ids.length; i += 1) {
    id = ids[i];
    c = controlState(id);
    cy = y + i * DETAIL_ROW_PITCH;
    if (c.kind === "device_toggle" || id.indexOf("_on") !== -1) {
      ghq_shared.button(hitZones, id, c.label || labelFor(id), x, cy + DETAIL_LABEL_H, DETAIL_SLIDER_W, DETAIL_CONTROL_H, c.normalized >= 0.5, {
        action: "trigger",
        controlId: id
      }, DETAIL_TOGGLE_FONT);
    } else {
      ghq_shared.slider(hitZones, id, sliderLabel(c, id), c.normalized || 0, x, cy + DETAIL_LABEL_H, DETAIL_SLIDER_W, DETAIL_CONTROL_H, {
        action: "set",
        controlId: id
      }, c.valueLabel || "");
    }
  }
}

function sliderLabel(c, id) {
  if (c.bound && c.parameterName) {
    return c.parameterName;
  }
  return c.label || labelFor(id);
}

function labelFor(id) {
  var i;
  for (i = 0; i < ghq_rack_map.controls.length; i += 1) {
    if (ghq_rack_map.controls[i].id === id) {
      return ghq_rack_map.controls[i].label;
    }
  }
  return id;
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
    if (rackState.controls[id].kind === "toggle" || id.indexOf("_on") !== -1) {
      rackState.controls[id].active = normalized >= 0.5;
    }
    mgraphics.redraw();
  }
  send("set_control", zone.data.controlId, normalized);
}

function onclick(x, y) {
  var zone = ghq_shared.findZone(hitZones, x, y);

  if (!zone) {
    return;
  }
  if (zone.data.action === "scan") {
    send("scan");
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

function tuner_state(json) {
  if (typeof json !== "string") {
    json = arrayfromargs(arguments).join(" ");
  }
  try {
    tuner = JSON.parse(json);
  } catch (error) {
    tuner = { frequency: 0, note: "--", cents: 0, confidence: 0 };
  }
  mgraphics.redraw();
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

function anything() {
  if (messagename === "rack_state") {
    rack_state.apply(this, arrayfromargs(arguments));
  } else if (messagename === "tuner_state") {
    tuner_state.apply(this, arrayfromargs(arguments));
  } else if (messagename === "control_state") {
    control_state.apply(this, arrayfromargs(arguments));
  }
}
