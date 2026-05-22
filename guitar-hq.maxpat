{
  "patcher": {
    "fileversion": 1,
    "appversion": {
      "major": 8,
      "minor": 6,
      "revision": 0,
      "architecture": "x64",
      "modernui": 1
    },
    "classnamespace": "box",
    "rect": [
      80,
      80,
      980,
      176
    ],
    "bglocked": 0,
    "openinpresentation": 1,
    "openrect": [
      0,
      0,
      980,
      176
    ],
    "devicewidth": 0,
    "statusbarvisible": 2,
    "default_fontsize": 12,
    "default_fontface": 0,
    "default_fontname": "Ableton Sans Medium",
    "gridonopen": 1,
    "gridsize": [
      15,
      15
    ],
    "toolbarvisible": 1,
    "boxes": [
      {
        "box": {
          "id": "ui",
          "maxclass": "jsui",
          "filename": "ghq_compact_ui.js",
          "varname": "ghq_compact_ui",
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patching_rect": [
            20,
            20,
            980,
            176
          ],
          "presentation": 1,
          "presentation_rect": [
            0,
            0,
            980,
            176
          ]
        }
      },
      {
        "box": {
          "id": "editor_patch",
          "maxclass": "newobj",
          "text": "p ghq_editor",
          "varname": "ghq_editor_patch",
          "patching_rect": [
            360,
            520,
            92,
            22
          ],
          "numinlets": 1,
          "numoutlets": 1,
          "outlettype": [
            ""
          ],
          "patcher": {
            "fileversion": 1,
            "appversion": {
              "major": 8,
              "minor": 6,
              "revision": 0,
              "architecture": "x64",
              "modernui": 1
            },
            "classnamespace": "box",
            "rect": [
              120,
              120,
              1180,
              620
            ],
            "bglocked": 0,
            "openinpresentation": 1,
            "default_fontsize": 12,
            "default_fontface": 0,
            "default_fontname": "Ableton Sans Medium",
            "toolbarvisible": 0,
            "title": "Guitar HQ",
            "boxes": [
              {
                "box": {
                  "id": "editor-in",
                  "maxclass": "inlet",
                  "numinlets": 0,
                  "numoutlets": 1,
                  "patching_rect": [
                    40,
                    700,
                    30,
                    22
                  ],
                  "outlettype": [
                    ""
                  ]
                }
              },
              {
                "box": {
                  "id": "editor-ui",
                  "maxclass": "jsui",
                  "filename": "ghq_editor_ui.js",
                  "varname": "ghq_editor_ui",
                  "numinlets": 1,
                  "numoutlets": 1,
                  "outlettype": [
                    ""
                  ],
                  "patching_rect": [
                    0,
                    0,
                    1180,
                    620
                  ],
                  "presentation": 1,
                  "presentation_rect": [
                    0,
                    0,
                    1180,
                    620
                  ]
                }
              },
              {
                "box": {
                  "id": "editor-out",
                  "maxclass": "outlet",
                  "numinlets": 1,
                  "numoutlets": 0,
                  "patching_rect": [
                    100,
                    700,
                    30,
                    22
                  ]
                }
              },
              {
                "box": {
                  "id": "editor-events",
                  "maxclass": "newobj",
                  "numinlets": 0,
                  "numoutlets": 1,
                  "patching_rect": [
                    160,
                    700,
                    132,
                    22
                  ],
                  "outlettype": [
                    ""
                  ],
                  "text": "r ghq_engine_events"
                }
              }
            ],
            "lines": [
              {
                "patchline": {
                  "source": [
                    "editor-in",
                    0
                  ],
                  "destination": [
                    "editor-ui",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "editor-events",
                    0
                  ],
                  "destination": [
                    "editor-ui",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "editor-ui",
                    0
                  ],
                  "destination": [
                    "editor-out",
                    0
                  ]
                }
              }
            ]
          }
        }
      },
      {
        "box": {
          "id": "engine",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            540,
            520,
            120,
            22
          ],
          "varname": "ghq_engine",
          "outlettype": [
            ""
          ],
          "text": "js ghq_engine.js"
        }
      },
      {
        "box": {
          "id": "plugin",
          "maxclass": "newobj",
          "numinlets": 0,
          "numoutlets": 2,
          "patching_rect": [
            60,
            420,
            58,
            22
          ],
          "outlettype": [
            "signal",
            "signal"
          ],
          "text": "plugin~"
        }
      },
      {
        "box": {
          "id": "plugout",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 0,
          "patching_rect": [
            60,
            470,
            64,
            22
          ],
          "text": "plugout~"
        }
      },
      {
        "box": {
          "id": "tuner-gain",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            60,
            520,
            52,
            22
          ],
          "outlettype": [
            "signal"
          ],
          "text": "*~ 8"
        }
      },
      {
        "box": {
          "id": "tuner-gain-recv",
          "maxclass": "newobj",
          "numinlets": 0,
          "numoutlets": 1,
          "patching_rect": [
            120,
            520,
            168,
            22
          ],
          "outlettype": [
            ""
          ],
          "text": "r ghq_tuner_analysis_gain"
        }
      },
      {
        "box": {
          "id": "tuner-detect",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 3,
          "patching_rect": [
            60,
            560,
            420,
            22
          ],
          "outlettype": [
            "float",
            "float",
            "bang"
          ],
          "text": "fzero~ @period 2048 @size 4096 @freqmin 40 @freqmax 1200 @threshold 0.01 @quiet 1"
        }
      },
      {
        "box": {
          "id": "tuner-pack",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            60,
            600,
            74,
            22
          ],
          "outlettype": [
            ""
          ],
          "text": "pack 0. 0."
        }
      },
      {
        "box": {
          "id": "tuner-prepend",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            60,
            640,
            148,
            22
          ],
          "outlettype": [
            ""
          ],
          "text": "prepend tuner_frequency"
        }
      },
      {
        "box": {
          "id": "loadbang",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            220,
            420,
            60,
            22
          ],
          "outlettype": [
            "bang"
          ],
          "text": "loadbang"
        }
      },
      {
        "box": {
          "id": "initmsg",
          "maxclass": "message",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            220,
            470,
            38,
            22
          ],
          "outlettype": [
            ""
          ],
          "text": "init"
        }
      },
      {
        "box": {
          "id": "live-thisdevice",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 2,
          "patching_rect": [
            220,
            520,
            96,
            22
          ],
          "outlettype": [
            "bang",
            "int"
          ],
          "text": "live.thisdevice"
        }
      },
      {
        "box": {
          "id": "live-ready-msg",
          "maxclass": "message",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            220,
            560,
            74,
            22
          ],
          "outlettype": [
            ""
          ],
          "text": "live_ready"
        }
      },
      {
        "box": {
          "id": "route-open",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 2,
          "patching_rect": [
            540,
            560,
            112,
            22
          ],
          "outlettype": [
            "",
            ""
          ],
          "text": "route open_editor"
        }
      },
      {
        "box": {
          "id": "openmsg",
          "maxclass": "message",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            540,
            600,
            42,
            22
          ],
          "outlettype": [
            ""
          ],
          "text": "open"
        }
      },
      {
        "box": {
          "id": "pcontrol",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            540,
            640,
            62,
            22
          ],
          "outlettype": [
            ""
          ],
          "text": "pcontrol"
        }
      },
      {
        "box": {
          "id": "ui-events",
          "maxclass": "newobj",
          "numinlets": 0,
          "numoutlets": 1,
          "patching_rect": [
            700,
            520,
            132,
            22
          ],
          "outlettype": [
            ""
          ],
          "text": "r ghq_engine_events"
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": [
            "plugin",
            0
          ],
          "destination": [
            "plugout",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "plugin",
            1
          ],
          "destination": [
            "plugout",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "plugin",
            0
          ],
          "destination": [
            "tuner-gain",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "tuner-gain-recv",
            0
          ],
          "destination": [
            "tuner-gain",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "tuner-gain",
            0
          ],
          "destination": [
            "tuner-detect",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "tuner-detect",
            0
          ],
          "destination": [
            "tuner-pack",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "tuner-detect",
            1
          ],
          "destination": [
            "tuner-pack",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "tuner-pack",
            0
          ],
          "destination": [
            "tuner-prepend",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "tuner-prepend",
            0
          ],
          "destination": [
            "engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "ui",
            0
          ],
          "destination": [
            "route-open",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "editor_patch",
            0
          ],
          "destination": [
            "route-open",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "route-open",
            0
          ],
          "destination": [
            "openmsg",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "route-open",
            1
          ],
          "destination": [
            "engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "openmsg",
            0
          ],
          "destination": [
            "pcontrol",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "pcontrol",
            0
          ],
          "destination": [
            "editor_patch",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "ui-events",
            0
          ],
          "destination": [
            "ui",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "loadbang",
            0
          ],
          "destination": [
            "initmsg",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "live-thisdevice",
            0
          ],
          "destination": [
            "live-ready-msg",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "live-ready-msg",
            0
          ],
          "destination": [
            "engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "initmsg",
            0
          ],
          "destination": [
            "ui",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "initmsg",
            0
          ],
          "destination": [
            "engine",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "initmsg",
            0
          ],
          "destination": [
            "editor_patch",
            0
          ]
        }
      }
    ],
    "dependency_cache": [
      {
        "name": "ghq_engine.js",
        "bootpath": ".",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "ghq_compact_ui.js",
        "bootpath": ".",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "ghq_editor_ui.js",
        "bootpath": ".",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "ghq_ui_shared.js",
        "bootpath": ".",
        "type": "TEXT",
        "implicit": 1
      },
      {
        "name": "ghq_rack_map.js",
        "bootpath": ".",
        "type": "TEXT",
        "implicit": 1
      }
    ]
  }
}