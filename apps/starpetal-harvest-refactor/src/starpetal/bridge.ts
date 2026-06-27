/**
 * Starpetal ↔ engine bridge — the single integration contract.
 *
 * The code under `src/game` and `src/components` is the vendored SDK engine. It
 * is kept pristine except for a handful of one-line calls into this module.
 * Everything the engine needs from the starpetal layer is exported here.
 *
 * Every engine file that references us imports `$starpetal/bridge` — grep for it
 * to see the entire integration surface. Each export below names its consumer.
 *
 * To add a feature you register it in this layer (here or in the folders it
 * aggregates); you should not need to edit `src/game` or `src/components`.
 *
 * Load-order rule: `config/*` (assets, symbolMap) is read while the engine
 * initialises, so those modules must not import the engine. The hooks below run
 * at call-time, so the engine↔bridge import cycle is harmless for them.
 *
 * One thing is NOT routed through here: custom book-event handlers are merged at
 * engine init-time, so `game/bookEventHandlerMap.ts` imports them *directly* from
 * `$starpetal/features` (reading them through this bridge would hit the init
 * cycle and silently drop them).
 */
import { starpetalAssets } from './config/assets';
import { SYMBOL_INFO_MAP } from './config/symbols';
import { isLocalPlayRoute, runDemoBook, runDemoAutoplay, initLocalDemoState } from './localPlay/localDemo';

/* ── data the engine pulls ──────────────────────────────────────────── */

/** game/assets.ts — merged over the base asset manifest. */
export const assets = starpetalAssets;

/** game/constants.ts — replaces the engine's SYMBOL_INFO_MAP. */
export const symbolMap = SYMBOL_INFO_MAP;

/* ── behaviour the engine calls (call-time) ─────────────────────────── */

/** routes/+layout.svelte · components/EnableGameActor.svelte · game/bookEventHandlerMap.ts */
export const isLocalRoute = isLocalPlayRoute;

/** routes/+layout.svelte — seed offline state on the dev /play route. */
export const initRoute = () => {
	if (isLocalPlayRoute()) initLocalDemoState();
};

/** components/EnableGameActor.svelte — offline plays a demo book; otherwise the
 *  engine's normal RGS bet. */
export const onBet = (placeRgsBet: () => void) => {
	if (isLocalPlayRoute()) {
		void runDemoBook();
		return;
	}
	placeRgsBet();
};

/** components/EnableGameActor.svelte — offline loops demo books (the engine's
 *  machine-driven autoplay assumes RGS and breaks on the bypass /play route);
 *  otherwise the engine's normal autoplay. */
export const onAutoBet = (placeAutoBet: () => void) => {
	if (isLocalPlayRoute()) {
		void runDemoAutoplay();
		return;
	}
	placeAutoBet();
};

/** game/bookEventHandlerMap.ts — skip RGS round-recording on the offline route. */
export const shouldRecordBookEvent = () => !isLocalPlayRoute();
