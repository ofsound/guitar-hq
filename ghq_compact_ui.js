autowatch = 0;
inlets = 1;
outlets = 1;

include("ghq_ui_shared.js");
include("ghq_rack_map.js");

mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

var WIDTH = 136;
var HEIGHT = 176;
var colors = ghq_shared.colors;
var hitZones = [];
var rackState = {
  title: ghq_rack_map.title,
  scanned: false,
  status: "Not scanned",
  controls: {}
};

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
}

function drawHeader() {
  var bound = rackState.boundCount || 0;
  var total = rackState.totalCount || ghq_rack_map.controls.length;
  var btnW = 48;
  var btnH = 24;
  var btnY = 138;
  var margin = 14;
  var offX = WIDTH - margin - btnW;

  ghq_shared.rect(0, 0, WIDTH, HEIGHT, colors.panel2);
  ghq_shared.text(rackState.title || "Guitar HQ", margin, 26, 17, colors.text);
  ghq_shared.text(bound + "/" + total + " mapped", margin, 50, 11, bound === total ? colors.green : colors.amber);
  ghq_shared.button(hitZones, "edit", "Edit", margin, 108, btnW, btnH, true, { action: "edit" });
  ghq_shared.button(hitZones, "scan", "Scan", margin, btnY, btnW, btnH, false, { action: "scan" });
  ghq_shared.button(hitZones, "panic", "Off", offX, btnY, btnW, btnH, false, { action: "panic" });
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
  }
}

function anything() {
  if (messagename === "rack_state") {
    rack_state.apply(this, arrayfromargs(arguments));
  } else if (messagename === "control_state") {
    control_state.apply(this, arrayfromargs(arguments));
  }
}
