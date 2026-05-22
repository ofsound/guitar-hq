// Data-only rack map for the Guitar HQ command center.
// Loaded via include() in Max and require() in Node tests.
var ghq_rack_map = {
  title: "Guitar HQ",
  expectedRack: "2026 Guitar Rack",
  deviceAliases: {
    ampSims: ["Amp Sims"],
    saturn: ["Saturn 2", "FabFilter Saturn 2", "Satur 2"],
    faceman: ["NA Faceman", "Nembrini Audio NA Faceman", "NAM Faceman"],
    overdriveSpecial: [
      "NA Overdrive Special",
      "Nembrini Audio NA Overdrive Special",
      "Overdrive Special"
    ],
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
      id: "amp_dry",
      label: "Dry",
      section: "Amp Sims",
      kind: "toggle",
      deviceKey: "ampSims",
      chainName: "Dry",
      parameter: ["Chain Activator", "Activator"]
    },
    {
      id: "amp_bassman",
      label: "Bassman",
      section: "Amp Sims",
      kind: "toggle",
      deviceKey: "ampSims",
      chainName: "Bassman",
      parameter: ["Chain Activator", "Activator"]
    },
    {
      id: "amp_dumble",
      label: "Dumble",
      section: "Amp Sims",
      kind: "toggle",
      deviceKey: "ampSims",
      chainName: "Dumble",
      parameter: ["Chain Activator", "Activator"]
    },
    {
      id: "amp_dry_vol",
      label: "Dry Vol",
      section: "Amp Sims",
      kind: "slider",
      deviceKey: "ampSims",
      chainName: "Dry",
      mixerParameter: "volume",
      parameter: ["Volume"]
    },
    {
      id: "amp_bassman_vol",
      label: "Bassman Vol",
      section: "Amp Sims",
      kind: "slider",
      deviceKey: "ampSims",
      chainName: "Bassman",
      mixerParameter: "volume",
      parameter: ["Volume"]
    },
    {
      id: "amp_dumble_vol",
      label: "Dumble Vol",
      section: "Amp Sims",
      kind: "slider",
      deviceKey: "ampSims",
      chainName: "Dumble",
      mixerParameter: "volume",
      parameter: ["Volume"]
    },
    {
      id: "satur_on",
      label: "Saturn 2",
      section: "Core",
      kind: "device_toggle",
      deviceKey: "saturn"
    },
    {
      id: "nam_on",
      label: "NA Faceman",
      section: "Core",
      kind: "device_toggle",
      deviceKey: "faceman"
    },
    {
      id: "cab_on",
      label: "Cab IRs",
      section: "Core",
      kind: "device_toggle",
      deviceKey: "cab",
      deviceIndex: 0
    },
    {
      id: "overdrive_on",
      label: "NA Overdrive Special",
      section: "Dumble",
      kind: "device_toggle",
      deviceKey: "overdriveSpecial"
    },
    {
      id: "cab_dumble_on",
      label: "Cab IRs",
      section: "Dumble",
      kind: "device_toggle",
      deviceKey: "cab",
      deviceIndex: 1
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
      id: "spring_reverb_on",
      label: "Spring Verb",
      section: "Spring",
      kind: "device_toggle",
      deviceKey: "spring",
      deviceIndex: 0
    },
    {
      id: "spring_tremolo_on",
      label: "Spring Trem",
      section: "Mod",
      kind: "device_toggle",
      deviceKey: "spring",
      deviceIndex: 1
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
      id: "mixbox_slot1_on",
      label: "Black 76",
      section: "MixBox",
      kind: "toggle",
      deviceKey: "mixBox",
      parameter: ["Slot 1 Power"]
    },
    {
      id: "mixbox_slot2_on",
      label: "Model 670",
      section: "MixBox",
      kind: "toggle",
      deviceKey: "mixBox",
      parameter: ["Slot 2 Power"]
    },
    {
      id: "mixbox_slot3_on",
      label: "White 2A",
      section: "MixBox",
      kind: "toggle",
      deviceKey: "mixBox",
      parameter: ["Slot 3 Power"]
    },
    {
      id: "mixbox_slot4_on",
      label: "Bus Compressor",
      section: "MixBox",
      kind: "toggle",
      deviceKey: "mixBox",
      parameter: ["Slot 4 Power"]
    },
    {
      id: "mixbox_slot5_on",
      label: "EQ PA",
      section: "MixBox",
      kind: "toggle",
      deviceKey: "mixBox",
      parameter: ["Slot 5 Power"]
    },
    {
      id: "mixbox_slot6_on",
      label: "EQ 81",
      section: "MixBox",
      kind: "toggle",
      deviceKey: "mixBox",
      parameter: ["Slot 6 Power"]
    },
    {
      id: "mixbox_slot7_on",
      label: "British EQ",
      section: "MixBox",
      kind: "toggle",
      deviceKey: "mixBox",
      parameter: ["Slot 7 Power"]
    },
    {
      id: "mixbox_slot8_on",
      label: "Vintage EQ-1A",
      section: "MixBox",
      kind: "toggle",
      deviceKey: "mixBox",
      parameter: ["Slot 8 Power"]
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
      id: "delay_l_ms",
      label: "Delay L Ms",
      section: "Delay Detail",
      kind: "slider",
      deviceKey: "valhallaDelay",
      parameter: ["DelayL_Ms", "Delay L Ms", "Delay L_Ms"],
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
      id: "spaceblender_time",
      label: "SpaceBlender Time",
      section: "Ambient Detail",
      kind: "slider",
      deviceKey: "spaceBlender",
      parameter: ["Time"],
      detail: true
    },
    {
      id: "spaceblender_color",
      label: "SpaceBlender Color",
      section: "Ambient Detail",
      kind: "slider",
      deviceKey: "spaceBlender",
      parameter: ["Color"],
      detail: true
    },
    {
      id: "spaceblender_texture",
      label: "SpaceBlender Texture",
      section: "Ambient Detail",
      kind: "slider",
      deviceKey: "spaceBlender",
      parameter: ["Texture"],
      detail: true
    },
    {
      id: "spaceblender_mod",
      label: "SpaceBlender Mod",
      section: "Ambient Detail",
      kind: "slider",
      deviceKey: "spaceBlender",
      parameter: ["Mod", "Modulation"],
      detail: true
    },
    {
      id: "spaceblender_mix",
      label: "SpaceBlender Mix",
      section: "Ambient Detail",
      kind: "slider",
      deviceKey: "spaceBlender",
      parameter: ["Mix", "Wet", "Wet Mix", "Dry/Wet"],
      detail: true
    },
    {
      id: "spring_reverb_mix",
      label: "Spring Mix",
      section: "Spring Detail",
      kind: "slider",
      deviceKey: "spring",
      deviceIndex: 0,
      parameter: ["Mix", "Wet", "Wet Mix", "Dry/Wet"],
      detail: true
    },
    {
      id: "spring_reverb_decay",
      label: "Spring Decay",
      section: "Spring Detail",
      kind: "slider",
      deviceKey: "spring",
      deviceIndex: 0,
      parameter: ["Decay", "Reverb Decay", "Spring Decay"],
      detail: true
    },
    {
      id: "spring_tremolo_intensity",
      label: "Tremolo Intensity",
      section: "Spring Trem Detail",
      kind: "slider",
      deviceKey: "spring",
      deviceIndex: 1,
      parameter: ["Intensity", "Tremolo Intensity", "Depth", "Amount"],
      detail: true
    },
    {
      id: "spring_tremolo_speed",
      label: "Tremolo Speed",
      section: "Spring Trem Detail",
      kind: "slider",
      deviceKey: "spring",
      deviceIndex: 1,
      parameter: ["Speed", "Tremolo Speed", "Rate"],
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
