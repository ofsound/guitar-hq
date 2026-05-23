// User-category Hybrid Reverb IR presets (Bassman + Dumble cabs share this list).
// Calibrate fileIndex values once in Live: load Hybrid Reverb, select User category,
// note each IR's position in the menu (0-based), and update entries below.
var ghq_hybrid_ir_presets = {
  userCategoryName: "User",
  columns: 4,
  entries: [
    { fileIndex: 0, shortLabel: "Cenzo V30-1" },
    { fileIndex: 1, shortLabel: "OHRx BLEND-1" },
    { fileIndex: 2, shortLabel: "OHRx CLSC-A1" },
    { fileIndex: 3, shortLabel: "OHRx CLSC-B1" },
    { fileIndex: 4, shortLabel: "OHRx CLSC-C1" },
    { fileIndex: 5, shortLabel: "OHRx CLSC-D1" },
    { fileIndex: 6, shortLabel: "OHRx CLSC-E1" },
    { fileIndex: 7, shortLabel: "OHRx MDRN-1" },
    { fileIndex: 8, shortLabel: "OHRx MDRN-2" },
    { fileIndex: 9, shortLabel: "OHRx MDRN-3" },
    { fileIndex: 10, shortLabel: "YA Mix 01" },
    { fileIndex: 11, shortLabel: "YA Mix 02" },
    { fileIndex: 12, shortLabel: "YA Mix 03" },
    { fileIndex: 13, shortLabel: "YA Mix 10" },
    { fileIndex: 14, shortLabel: "YA Mix 11" },
    { fileIndex: 15, shortLabel: "YA Mix 12" }
  ]
};

function padCabIrIndex(index) {
  return index < 10 ? "0" + index : String(index);
}

function buildCabIrControlsForAmp(prefix, deviceIndex, section) {
  var controls = [];
  var entries = ghq_hybrid_ir_presets.entries;
  var i;
  var entry;

  for (i = 0; i < entries.length; i += 1) {
    entry = entries[i];
    controls.push({
      id: prefix + "_cab_ir_" + padCabIrIndex(i),
      label: entry.shortLabel,
      section: section,
      kind: "hybrid_ir",
      deviceKey: "cab",
      deviceIndex: deviceIndex,
      irFileIndex: entry.fileIndex,
      detail: true,
      optional: true
    });
  }
  return controls;
}

function buildAllCabIrControls() {
  return buildCabIrControlsForAmp("bassman", 0, "Bassman Cabs").concat(
    buildCabIrControlsForAmp("dumble", 1, "Dumble Cabs")
  );
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    presets: ghq_hybrid_ir_presets,
    buildAllCabIrControls: buildAllCabIrControls
  };
}
