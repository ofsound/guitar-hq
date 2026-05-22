// Data-only rack map for the Guitar HQ command center.
// Loaded via include() in Max and require() in Node tests.
var ghq_rack_map = {
  title: "Guitar HQ",
  expectedRack: "2026 Guitar Rack",
  deviceAliases: {
    utility: ["Utility", "StereoGain"],
    ampSims: ["Amp Sims"],
    saturn: ["Saturn 2", "FabFilter Saturn 2", "Satur 2"],
    faceman: ["NA Faceman", "Nembrini Audio NA Faceman", "NAM Faceman"],
    // Hybrid Reverb is the Live device name for the cab IR loader in this rack.
    cab: ["Cab IRs", "Hybrid Reverb"],
    tuner: ["Tuner"],
    valhallaDelay: ["ValhallaDelay", "Valhalla Delay"],
    valhallaSupermassive: ["ValhallaSupermassive", "Valhalla Supermassive"],
    spaceBlender: ["SpaceBlender", "Space Blender"],
    spring: ["Spring"],
    chorus: ["Chorus"],
    flanger: ["Flanger"],
    phaseMistress: ["PhaseMistress", "Phase Mistress"],
    superPlate: ["SuperPlate", "Super Plate"],
    mixBox: ["MixBox", "Mix Box"]
  },
  controls: [
    {
      id: "utility_width",
      label: "Width",
      section: "Input",
      kind: "slider",
      deviceKey: "utility",
      parameter: ["Width", "Stereo Width"],
      defaultNormalized: 1
    },
    {
      id: "utility_gain",
      label: "Gain",
      section: "Input",
      kind: "slider",
      deviceKey: "utility",
      parameter: ["Gain", "Output Gain"],
      defaultNormalized: 0.5
    },
    {
      id: "utility_mono",
      label: "Mono",
      section: "Input",
      kind: "toggle",
      deviceKey: "utility",
      parameter: ["Mono"]
    },
    {
      id: "amp_dry",
      label: "Dry",
      section: "Amp Sims",
      kind: "select",
      deviceKey: "ampSims",
      parameter: ["Chain Selector", "Chain Select", "Selector"],
      value: 0
    },
    {
      id: "amp_bassman",
      label: "Bassman",
      section: "Amp Sims",
      kind: "select",
      deviceKey: "ampSims",
      parameter: ["Chain Selector", "Chain Select", "Selector"],
      value: 1
    },
    {
      id: "amp_dumble",
      label: "Dumble",
      section: "Amp Sims",
      kind: "select",
      deviceKey: "ampSims",
      parameter: ["Chain Selector", "Chain Select", "Selector"],
      value: 2
    },
    {
      id: "satur_on",
      label: "Saturn 2",
      section: "Core",
      kind: "device_toggle",
      deviceKey: "saturn",
      match: "all"
    },
    {
      id: "nam_on",
      label: "NA Faceman",
      section: "Core",
      kind: "device_toggle",
      deviceKey: "faceman",
      match: "all"
    },
    {
      id: "cab_on",
      label: "Cab IRs",
      section: "Core",
      kind: "device_toggle",
      deviceKey: "cab",
      match: "all"
    },
    {
      id: "tuner_on",
      label: "Tuner",
      section: "Utility",
      kind: "device_toggle",
      deviceKey: "tuner"
    },
    {
      id: "delay_on",
      label: "Delay",
      section: "Time",
      kind: "device_toggle",
      deviceKey: "valhallaDelay"
    },
    {
      id: "supermassive_on",
      label: "Supermassive",
      section: "Time",
      kind: "device_toggle",
      deviceKey: "valhallaSupermassive"
    },
    {
      id: "spaceblender_on",
      label: "SpaceBlender",
      section: "Time",
      kind: "device_toggle",
      deviceKey: "spaceBlender"
    },
    {
      id: "spring_on",
      label: "Spring",
      section: "Mod",
      kind: "device_toggle",
      deviceKey: "spring"
    },
    {
      id: "chorus_on",
      label: "Chorus",
      section: "Mod",
      kind: "device_toggle",
      deviceKey: "chorus"
    },
    {
      id: "flanger_on",
      label: "Flanger",
      section: "Mod",
      kind: "device_toggle",
      deviceKey: "flanger"
    },
    {
      id: "phase_on",
      label: "PhaseMistress",
      section: "Mod",
      kind: "device_toggle",
      deviceKey: "phaseMistress"
    },
    {
      id: "plate_on",
      label: "SuperPlate",
      section: "Verb",
      kind: "device_toggle",
      deviceKey: "superPlate"
    },
    {
      id: "mixbox_on",
      label: "MixBox",
      section: "Verb",
      kind: "device_toggle",
      deviceKey: "mixBox"
    },
    {
      id: "delay_mix",
      label: "Delay Mix",
      section: "Delay Detail",
      kind: "slider",
      deviceKey: "valhallaDelay",
      parameter: ["Mix", "Wet", "Wet Mix", "Output Mix"],
      detail: true
    },
    {
      id: "delay_feedback",
      label: "Delay Feedback",
      section: "Delay Detail",
      kind: "slider",
      deviceKey: "valhallaDelay",
      parameter: ["Feedback", "Delay Feedback"],
      detail: true
    },
    {
      id: "delay_width",
      label: "Delay Width",
      section: "Delay Detail",
      kind: "slider",
      deviceKey: "valhallaDelay",
      parameter: ["Width", "Stereo Width", "Spread"],
      detail: true
    },
    {
      id: "supermassive_mix",
      label: "Supermassive Mix",
      section: "Reverb Detail",
      kind: "slider",
      deviceKey: "valhallaSupermassive",
      parameter: ["Mix", "Wet", "Wet Mix"],
      detail: true
    },
    {
      id: "supermassive_feedback",
      label: "Supermassive Feedback",
      section: "Reverb Detail",
      kind: "slider",
      deviceKey: "valhallaSupermassive",
      parameter: ["Feedback", "Density"],
      detail: true
    },
    {
      id: "plate_mix",
      label: "Plate Mix",
      section: "Reverb Detail",
      kind: "slider",
      deviceKey: "superPlate",
      parameter: ["Mix", "Wet", "Wet/Dry", "Output"],
      detail: true
    },
    {
      id: "chorus_amount",
      label: "Chorus Amount",
      section: "Mod Detail",
      kind: "slider",
      deviceKey: "chorus",
      parameter: ["Amount", "Dry/Wet", "Wet", "Mix"],
      detail: true
    },
    {
      id: "flanger_amount",
      label: "Flanger Amount",
      section: "Mod Detail",
      kind: "slider",
      deviceKey: "flanger",
      parameter: ["Amount", "Dry/Wet", "Wet", "Mix"],
      detail: true
    },
    {
      id: "phase_mix",
      label: "Phase Mix",
      section: "Mod Detail",
      kind: "slider",
      deviceKey: "phaseMistress",
      parameter: ["Mix", "Wet", "Depth"],
      detail: true
    },
    {
      id: "tuner_reference",
      label: "Tuner Reference",
      section: "Tuner",
      kind: "slider",
      deviceKey: "tuner",
      parameter: ["Reference", "Reference Hz", "Tuning Reference"],
      detail: true,
      optional: true
    }
  ]
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = ghq_rack_map;
}
