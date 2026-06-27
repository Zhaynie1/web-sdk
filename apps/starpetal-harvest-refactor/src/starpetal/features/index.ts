/**
 * Custom book-event handlers, merged over the engine's base handlers by
 * game/bookEventHandlerMap.ts (via the bridge). starpetal's books carry custom
 * events the engine doesn't know; the engine throws on an unknown event type, so
 * these must exist.
 *
 * Ported handlers live in sibling modules; the remaining no-ops are events that
 * exist in starpetal's event set but appear in *no* shipped book (audited across
 * base + bonus books), kept defensively so a future book can never crash the
 * engine. Keep this module free of game/utils + game/bookEventHandlerMap (it is
 * spread into the map at module-init — stay out of the init cycle).
 */
import { boardMultiplierInfo } from './multiplier';
import { starfall, petalSpread, stickyWildVines } from './boardEffects';

const noop = async () => {};

export const bookEventHandlers: Record<string, (event: any, ctx: any) => Promise<void>> = {
	boardMultiplierInfo,
	starfall,
	petalSpread,
	stickyWildVines,
	// Absent from all shipped books — defensive no-ops.
	wincap: noop,
	bloomLink: noop,
	symbolUpgrade: noop,
};
