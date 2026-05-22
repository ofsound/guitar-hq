const fs = require("fs");

const maxpatPath = "guitar-hq.maxpat";
const amxdPath = "Guitar-HQ.amxd";
// Analysis-only gain before fzero~ (does not affect plugin~ → plugout~ pass-through).
const TUNER_ANALYSIS_GAIN = 8;

function box(id, maxclass, text, rect, extra = {}) {
  const b = {
    id,
    maxclass,
    numinlets: extra.numinlets ?? 1,
    numoutlets: extra.numoutlets ?? 1,
    patching_rect: rect,
    ...extra
  };
  if (text) b.text = text;
  return { box: b };
}

function line(src, outlet, dst, inlet) {
  return { patchline: { source: [src, outlet], destination: [dst, inlet] } };
}

function editorSubpatcher() {
  return {
    fileversion: 1,
    appversion: {
      major: 8,
      minor: 6,
      revision: 0,
      architecture: "x64",
      modernui: 1
    },
    classnamespace: "box",
    rect: [120.0, 120.0, 1180.0, 620.0],
    bglocked: 0,
    openinpresentation: 1,
    default_fontsize: 12.0,
    default_fontface: 0,
    default_fontname: "Ableton Sans Medium",
    toolbarvisible: 0,
    title: "Guitar HQ",
    boxes: [
      box("editor-in", "inlet", "", [40.0, 700.0, 30.0, 22.0], {
        numinlets: 0,
        numoutlets: 1,
        outlettype: [""]
      }),
      {
        box: {
          id: "editor-ui",
          maxclass: "jsui",
          filename: "ghq_editor_ui.js",
          varname: "ghq_editor_ui",
          numinlets: 1,
          numoutlets: 1,
          outlettype: [""],
          patching_rect: [0.0, 0.0, 1180.0, 620.0],
          presentation: 1,
          presentation_rect: [0.0, 0.0, 1180.0, 620.0]
        }
      },
      box("editor-out", "outlet", "", [100.0, 700.0, 30.0, 22.0], {
        numinlets: 1,
        numoutlets: 0
      }),
      box("editor-events", "newobj", "r ghq_engine_events", [160.0, 700.0, 132.0, 22.0], {
        numinlets: 0,
        numoutlets: 1,
        outlettype: [""]
      })
    ],
    lines: [
      line("editor-in", 0, "editor-ui", 0),
      line("editor-events", 0, "editor-ui", 0),
      line("editor-ui", 0, "editor-out", 0)
    ]
  };
}

const patch = {
  patcher: {
    fileversion: 1,
    appversion: {
      major: 8,
      minor: 6,
      revision: 0,
      architecture: "x64",
      modernui: 1
    },
    classnamespace: "box",
    rect: [80.0, 80.0, 980.0, 176.0],
    bglocked: 0,
    openinpresentation: 1,
    openrect: [0.0, 0.0, 980.0, 176.0],
    devicewidth: 0.0,
    statusbarvisible: 2,
    default_fontsize: 12.0,
    default_fontface: 0,
    default_fontname: "Ableton Sans Medium",
    gridonopen: 1,
    gridsize: [15.0, 15.0],
    toolbarvisible: 1,
    boxes: [
      {
        box: {
          id: "ui",
          maxclass: "jsui",
          filename: "ghq_compact_ui.js",
          varname: "ghq_compact_ui",
          numinlets: 1,
          numoutlets: 1,
          outlettype: [""],
          patching_rect: [20.0, 20.0, 980.0, 176.0],
          presentation: 1,
          presentation_rect: [0.0, 0.0, 980.0, 176.0]
        }
      },
      {
        box: {
          id: "editor_patch",
          maxclass: "newobj",
          text: "p ghq_editor",
          varname: "ghq_editor_patch",
          patching_rect: [360.0, 520.0, 92.0, 22.0],
          numinlets: 1,
          numoutlets: 1,
          outlettype: [""],
          patcher: editorSubpatcher()
        }
      },
      box("engine", "newobj", "js ghq_engine.js", [540.0, 520.0, 120.0, 22.0], {
        varname: "ghq_engine",
        numinlets: 1,
        numoutlets: 1,
        outlettype: [""]
      }),
      box("plugin", "newobj", "plugin~", [60.0, 420.0, 58.0, 22.0], {
        numinlets: 0,
        numoutlets: 2,
        outlettype: ["signal", "signal"]
      }),
      box("plugout", "newobj", "plugout~", [60.0, 470.0, 64.0, 22.0], {
        numinlets: 2,
        numoutlets: 0
      }),
      box("tuner-gain", "newobj", "*~ " + TUNER_ANALYSIS_GAIN, [60.0, 520.0, 52.0, 22.0], {
        numinlets: 2,
        numoutlets: 1,
        outlettype: ["signal"]
      }),
      box("tuner-gain-recv", "newobj", "r ghq_tuner_analysis_gain", [120.0, 520.0, 168.0, 22.0], {
        numinlets: 0,
        numoutlets: 1,
        outlettype: [""]
      }),
      box("tuner-detect", "newobj", "fzero~ @period 2048 @size 4096 @freqmin 40 @freqmax 1200 @threshold 0.01 @quiet 1", [60.0, 560.0, 420.0, 22.0], {
        numinlets: 1,
        numoutlets: 3,
        outlettype: ["float", "float", "bang"]
      }),
      box("tuner-pack", "newobj", "pack 0. 0.", [60.0, 600.0, 74.0, 22.0], {
        numinlets: 2,
        numoutlets: 1,
        outlettype: [""]
      }),
      box("tuner-prepend", "newobj", "prepend tuner_frequency", [60.0, 640.0, 148.0, 22.0], {
        numinlets: 1,
        numoutlets: 1,
        outlettype: [""]
      }),
      box("loadbang", "newobj", "loadbang", [220.0, 420.0, 60.0, 22.0], {
        numinlets: 1,
        numoutlets: 1,
        outlettype: ["bang"]
      }),
      box("initmsg", "message", "init", [220.0, 470.0, 38.0, 22.0], {
        numinlets: 2,
        numoutlets: 1,
        outlettype: [""]
      }),
      box("live-thisdevice", "newobj", "live.thisdevice", [220.0, 520.0, 96.0, 22.0], {
        numinlets: 1,
        numoutlets: 2,
        outlettype: ["bang", "int"]
      }),
      box("live-ready-msg", "message", "live_ready", [220.0, 560.0, 74.0, 22.0], {
        numinlets: 2,
        numoutlets: 1,
        outlettype: [""]
      }),
      box("route-open", "newobj", "route open_editor", [540.0, 560.0, 112.0, 22.0], {
        numinlets: 1,
        numoutlets: 2,
        outlettype: ["", ""]
      }),
      box("openmsg", "message", "open", [540.0, 600.0, 42.0, 22.0], {
        numinlets: 2,
        numoutlets: 1,
        outlettype: [""]
      }),
      box("pcontrol", "newobj", "pcontrol", [540.0, 640.0, 62.0, 22.0], {
        numinlets: 1,
        numoutlets: 1,
        outlettype: [""]
      }),
      box("ui-events", "newobj", "r ghq_engine_events", [700.0, 520.0, 132.0, 22.0], {
        numinlets: 0,
        numoutlets: 1,
        outlettype: [""]
      })
    ],
    lines: [
      line("plugin", 0, "plugout", 0),
      line("plugin", 1, "plugout", 1),
      line("plugin", 0, "tuner-gain", 0),
      line("tuner-gain-recv", 0, "tuner-gain", 1),
      line("tuner-gain", 0, "tuner-detect", 0),
      line("tuner-detect", 0, "tuner-pack", 0),
      line("tuner-detect", 1, "tuner-pack", 1),
      line("tuner-pack", 0, "tuner-prepend", 0),
      line("tuner-prepend", 0, "engine", 0),
      line("ui", 0, "route-open", 0),
      line("editor_patch", 0, "route-open", 0),
      line("route-open", 0, "openmsg", 0),
      line("route-open", 1, "engine", 0),
      line("openmsg", 0, "pcontrol", 0),
      line("pcontrol", 0, "editor_patch", 0),
      line("ui-events", 0, "ui", 0),
      line("loadbang", 0, "initmsg", 0),
      line("live-thisdevice", 0, "live-ready-msg", 0),
      line("live-ready-msg", 0, "engine", 0),
      line("initmsg", 0, "ui", 0),
      line("initmsg", 0, "engine", 0),
      line("initmsg", 0, "editor_patch", 0)
    ],
    dependency_cache: [
      { name: "ghq_engine.js", bootpath: ".", type: "TEXT", implicit: 1 },
      { name: "ghq_compact_ui.js", bootpath: ".", type: "TEXT", implicit: 1 },
      { name: "ghq_editor_ui.js", bootpath: ".", type: "TEXT", implicit: 1 },
      { name: "ghq_ui_shared.js", bootpath: ".", type: "TEXT", implicit: 1 },
      { name: "ghq_rack_map.js", bootpath: ".", type: "TEXT", implicit: 1 }
    ]
  }
};

const json = JSON.stringify(patch, null, 2);
fs.writeFileSync(maxpatPath, json);

const payload = Buffer.from(json, "utf8");
const header = Buffer.alloc(32);
header.write("ampf", 0, "ascii");
header.writeUInt32LE(4, 4);
// Max for Live device type marker. Audio effects use `aaaameta` with value 7;
// MIDI effects use `mmmmmeta`, which would make Live reject this on audio tracks.
header.write("aaaameta", 8, "ascii");
header.writeUInt32LE(4, 16);
header.writeUInt32LE(7, 20);
header.write("ptch", 24, "ascii");
header.writeUInt32LE(payload.length, 28);
fs.writeFileSync(amxdPath, Buffer.concat([header, payload]));

console.log(`wrote ${maxpatPath} and ${amxdPath}`);

require("./sync-user-library.js")();
