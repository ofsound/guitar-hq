# Guitar HQ

Guitar HQ is a Max for Live Audio Effect command center for
`2026 Guitar Rack.adg`. It does not generate MIDI. It passes audio through
unchanged and controls devices in nearby Live chains and nested Audio Effect
Racks with LiveAPI.

## Rack Map

The map targets the **`2026 Guitar Rack`** Audio Effect Rack preset (`.adg` in your Ableton User Library). If you fork the rack, update `expectedRack` and `deviceAliases` in `ghq_rack_map.js`.

Devices and nested chains referenced by the map:

- `Utility`
- `Amp Sims` with `Dry`, `Bassman`, and `Dumble` chain-selector buttons
- `Saturn 2`
- `NA Faceman`
- `Cab IRs` (scanned as **Hybrid Reverb** in this rack)
- `Tuner`
- `ValhallaDelay`
- `ValhallaSupermassive`
- `SpaceBlender`
- `Spring`
- `Chorus`
- `Flanger`
- `PhaseMistress`
- `SuperPlate`
- `MixBox`

The control definitions live in `ghq_rack_map.js`. Device and parameter names
are matched case-insensitively. `Saturn 2`, `NA Faceman`, and `Cab IRs` are
nested inside the `Amp Sims` rack chains, so those buttons bind to all matching
nested instances found during scan.

## Development

```sh
npm run verify
```

This writes `guitar-hq.maxpat` and `Guitar-HQ.amxd` in this folder, then
syncs the runtime files into your Ableton User Library before validating the
generated patch and embedded device payload.

To sync after editing `.js` files without rebuilding:

```sh
npm run sync
```

To keep the User Library copy updated while editing:

```sh
npm run sync:watch
```

Override the destination folder with `GHQ_ABLETON_DEST` if needed.

## Using In Live

Copy or sync these files into the same User Library folder (default: `Presets/Audio Effects/Max Audio Effect/`):

- `Guitar-HQ.amxd`
- `ghq_engine.js`
- `ghq_compact_ui.js`
- `ghq_editor_ui.js`
- `ghq_ui_shared.js`
- `ghq_rack_map.js`

`npm run sync` copies exactly that set (see `scripts/sync-user-library.js`).

Drop the device next to **`2026 Guitar Rack`** or inside one of its chains. Click **Scan** after renaming devices or moving the command center.

The device recursively scans sibling devices and nested rack chains on the current Live track, then controls matched devices by name.
