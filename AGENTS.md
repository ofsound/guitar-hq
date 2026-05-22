# Agent Execution Protocol: Guitar HQ

## 1. Boot sequence

- **Scan:** Read every `.cursor/rules/*.mdc` before your first substantive reply.
- **Stack:** Max for Live **Audio Effect** for **Ableton Live 12.4+**. Logic lives in Max **`js`** / **`jsui`** files (ES5-style JavaScript: `var`, `function`, no bundler). **Node.js** is only for `ghq_rack_map.test.js`, syntax checks, and `scripts/*`.
- **Ignore:** Svelte/React/Tailwind/Vite/TanStack rules and MCP skills unless this repo gains those files.
- **Workflow source of truth:** `.cursor/rules/post-edit-verification.mdc` — especially **Ableton User Library sync** after device edits.
- **Rack target:** Controls are defined for the **`2026 Guitar Rack`** preset (`ghq_rack_map.js`). The device scans sibling/nested devices on the current track and drives parameters via **LiveAPI**.

---

## 2. Reasoning and constraints

### A. Think before coding

- **Surface tradeoffs:** State assumptions explicitly. If two or more interpretations exist, **ask**; do not guess.
- **Halt on ambiguity:** If a request is unclear, name the confusion and stop.
- **Senior dev filter:** Prefer the smallest change that satisfies the request. No speculative abstractions.

### B. Surgical implementation

- **Strict scope:** Change only what the task requires.
- **No side effects:** Do not refactor adjacent code, comments, or formatting.
- **Style match:** Mirror existing patterns in `ghq_*.js` and `scripts/` (top-level Max message handlers, `safeMessnamed` / `safeOutlet`, `include()` for shared modules).
- **Rack map first:** New knobs/buttons usually need entries in `ghq_rack_map.js` (`deviceKey`, `parameter` alias lists, `kind`) before engine/UI work.
- **Orphan policy:** Remove symbols made unused by *your* edits. Leave pre-existing dead code alone.

### C. Goal-driven loop

1. **Reproduce:** Extend `ghq_rack_map.test.js`, run `npm test`, or define a concrete failure in Live (place device next to the rack, click **Scan**).
2. **Execute:** Implement the minimum change.
3. **Verify:** Post-edit gate — **sync to User Library is mandatory** (see below).

---

## 3. Repository map

| Path | Role |
|------|------|
| `ghq_engine.js` | LiveAPI scan/bind, parameter writes, tuner state, event emit |
| `ghq_rack_map.js` | Data-only control definitions and device/parameter aliases |
| `ghq_compact_ui.js` | Device-strip `jsui` (Presentation) |
| `ghq_editor_ui.js` | Floating editor subpatcher `jsui` |
| `ghq_ui_shared.js` | Shared mgraphics helpers (`include` from both UIs) |
| `guitar-hq.maxpat` | Editable Max patch JSON (generated shell) |
| `Guitar-HQ.amxd` | Loadable M4L device (embedded patch) |
| `ghq_rack_map.test.js` | Node validation of rack map schema |
| `scripts/build-device-patch.js` | Regenerates `.maxpat` + `.amxd`, then syncs |
| `scripts/validate-device-patch.js` | Patchline bounds, audio pass-through, `.amxd` payload |
| `scripts/sync-user-library.js` | Copies device artifacts into Ableton User Library |

There is **no** `docs/` folder in this repo — do not reference Kick Snare Hat feature-prep docs.

---

## 4. Architecture (do not break casually)

- **Not a MIDI device:** Audio passes through `plugin~` → `plugout~` unchanged. No step sequencer, transport, or `pattrstorage`.
- **Engine ↔ UI:** Engine broadcasts on `ghq_engine_events` via `messnamed` only: `rack_state`, `control_state`, `tuner_state` (JSON strings). Each `jsui` has one `r ghq_engine_events` (compact on root patch, editor inside subpatcher).
- **UI → engine:** UIs `outlet(0, ...)` into the patch; `route open_editor` sends editor open to `pcontrol`, everything else to `js ghq_engine.js` (`scan`, `set_control`, `trigger_control`, `all_off`, …).
- **LiveAPI:** `scan()` walks devices from the device’s chain (siblings + nested rack chains). Bindings match `ghq_rack_map.deviceAliases` and `parameter` names case-insensitively. User must **Scan** after rack moves/renames.
- **Tuner:** `fzero~` on incoming audio → `tuner_frequency` → engine → `tuner_state` events.
- **Dual load of rack map:** `ghq_rack_map.js` via `include()` in Max and `require()` in Node tests; engine loads it the same way.

---

## 5. Post-edit gate (required)

### Always sync (non-negotiable)

After **any** change to device runtime files (`.js`, `.maxpat`, `.amxd`, or build/sync scripts):

```sh
node scripts/sync-user-library.js
```

Copies into **`~/Music/Ableton/User Library/Presets/Audio Effects/Max Audio Effect/`** by default. Override with **`GHQ_ABLETON_DEST`**. Live loads `.js` from that folder beside `Guitar-HQ.amxd` — **edits in the repo do nothing in Live until sync succeeds.**

Convenience: `npm run sync` or `npm run sync:watch` while iterating.

### Tests and rebuild (by what changed)

| What changed | Run before finishing |
|--------------|----------------------|
| `ghq_rack_map.js` or `ghq_rack_map.test.js` | `node ghq_rack_map.test.js` |
| Any `ghq_*.js` engine/UI | `node --check <file>` (or `npm test`) |
| Any device file | `node scripts/validate-device-patch.js` |
| `guitar-hq.maxpat` or `scripts/build-device-patch.js` | `node scripts/build-device-patch.js` then validate |
| **Always** (device edits) | **`node scripts/sync-user-library.js`** |

Full gate: `npm run verify` (build + test + validate; build already syncs).

`node scripts/build-device-patch.js` calls sync at the end; if you only edited `.js` without rebuilding, **still run sync explicitly.**

Docs-only edits (`README.md`, `.cursor/rules`, `AGENTS.md`) do not require sync unless paired with device changes.

---

**Status:** Protocol active for Guitar HQ.
