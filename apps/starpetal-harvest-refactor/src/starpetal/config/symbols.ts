/**
 * Starpetal symbol map, expressed in the engine's SYMBOL_INFO_MAP schema but
 * sprite-only (starpetal art has no per-symbol spine). Rendered by cluster's
 * Symbol/SymbolSprite components.
 *
 * IMPORTANT: each state gets a *distinct* object. getSymbolInfo returns the
 * state's object by reference; cluster's SymbolSprite fires `oncomplete` from an
 * $effect keyed on symbolInfo, and the engine awaits that on win. If states
 * shared one object, symbolInfo wouldn't change on static→win and the win await
 * would hang. Distinct objects make the transition observable.
 */

const explosion = {
	type: 'spine',
	assetKey: 'explosion',
	animationName: 'explosion',
	sizeRatios: { width: 1, height: 1 },
} as const;

const sprite = (assetKey: string, w: number, h: number) => ({
	type: 'sprite' as const,
	assetKey,
	sizeRatios: { width: w, height: h },
});

const states = (assetKey: string, w = 1, h = 1) => ({
	explosion,
	win: sprite(assetKey, w, h),
	postWinStatic: sprite(assetKey, w, h),
	static: sprite(assetKey, w, h),
	spin: sprite(assetKey, w, h),
	land: sprite(assetKey, w, h),
});

// Cluster books use 5 highs (H1–H5) + 4 lows (L1–L4); starpetal art has 4 highs
// + 3 lows, so H5 and L4 reuse a tier-mate's art until real starpetal books land.
// Art per pay-key must match the paytable (payTableData.ts), so each symbol on the reels
// pays the value the paytable shows for it. Ranked highest→lowest:
// H1 White Flower (grove bloom), H2 Gold Star (starpetal), H3 Firefly (cosmic wasp),
// H4 Fox (lunar fox), L1 Butterfly (aurora), L2 Raindrop (dewdrop), L3 Leaf (starfall).
export const SYMBOL_INFO_MAP = {
	H1: states('sp_l3'),
	H2: states('sp_h1'),
	H3: states('sp_h2'),
	H4: states('sp_h3'),
	H5: states('sp_l3'), // unused by current books
	L1: states('sp_h4'),
	L2: states('sp_l1'),
	L3: states('sp_l2'),
	L4: states('sp_l2'), // unused by current books
	W: states('sp_w', 1.12, 1.12),
	S: states('sp_s', 1.24, 1.24),
	// Multiplier dewdrops — getSymbolKey returns `M_<value>` for { name:'M', multiplier }.
	M_2: states('sp_m2'),
	M_4: states('sp_m4'),
	M_8: states('sp_m8'),
	M_16: states('sp_m16'),
	M_32: states('sp_m32'),
	M_64: states('sp_m64'),
	M_128: states('sp_m128'),
	M_256: states('sp_m256'),
	M_512: states('sp_m512'),
} as const;
