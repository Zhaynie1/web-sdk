# src/starpetal — the game layer

Everything specific to Star Petal Forrest lives here. The code under `src/game`
and `src/components` is the vendored SDK engine (a clone of the `cluster` sample)
and is kept pristine.

## Integration

`bridge.ts` is the **single contract** between this layer and the engine. It
exports the data the engine pulls (assets, symbol map) and the behaviour it calls
(offline route hooks, bet handling). Each export documents the engine file that
consumes it.

**To add a feature, register it in this layer — you should not need to edit
`src/game` or `src/components`.** Engine files reach into our code via
`$starpetal/bridge`, with two deliberate exceptions:

- custom book-event handlers merge from `$starpetal/features` (kept out of the
  init cycle, since they're spread into the handler map at module-init), and
- UI components are imported directly from `$starpetal/ui/` where they render
  (routing a context-dependent component through the data bridge would drag the
  whole UI/context graph into the asset-manifest init path).

To see the full integration surface: `grep -rn '$starpetal/' src/game src/components src/routes`.

## Layout

- `bridge.ts` — engine ↔ layer contract (start here)
- `config/` — asset manifest + symbol map (init-time data; must not import the engine)
- `features/` — custom book-event handlers (Phase 4)
- `ui/` — vine skin + `StarpetalLayer` (Phase 3)
- `localPlay/` — dev offline harness (the `/play` route)
