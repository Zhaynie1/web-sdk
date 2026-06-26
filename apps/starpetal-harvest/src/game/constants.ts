import _ from 'lodash';

import type { RawSymbol, SymbolState } from './types';

export const SYMBOL_SIZE = 80;

export const REEL_PADDING = 0.53;

// initial board (padded top and bottom) — 7 reels × 9 rows (7 visible + 2 padding)
export const INITIAL_BOARD: RawSymbol[][] = [
	[
		{ name: 'L1' },
		{ name: 'H1' },
		{ name: 'L2' },
		{ name: 'L1' },
		{ name: 'H1' },
		{ name: 'H4' },
		{ name: 'H1' },
		{ name: 'L2' },
		{ name: 'H3' },
	],
	[
		{ name: 'L3' },
		{ name: 'H2' },
		{ name: 'L1' },
		{ name: 'L2' },
		{ name: 'S', scatter: true },
		{ name: 'S', scatter: true },
		{ name: 'L2' },
		{ name: 'L2' },
		{ name: 'H2' },
	],
	[
		{ name: 'L2' },
		{ name: 'H3' },
		{ name: 'L3' },
		{ name: 'L3' },
		{ name: 'H4' },
		{ name: 'L2' },
		{ name: 'L2' },
		{ name: 'H4' },
		{ name: 'H2' },
	],
	[
		{ name: 'L3' },
		{ name: 'H4' },
		{ name: 'L1' },
		{ name: 'L3' },
		{ name: 'H2' },
		{ name: 'H1' },
		{ name: 'H1' },
		{ name: 'L3' },
		{ name: 'L3' },
	],
	[
		{ name: 'H3' },
		{ name: 'H4' },
		{ name: 'L2' },
		{ name: 'H2' },
		{ name: 'S', scatter: true },
		{ name: 'L2' },
		{ name: 'L1' },
		{ name: 'L3' },
		{ name: 'L3' },
	],
	[
		{ name: 'H2' },
		{ name: 'H2' },
		{ name: 'S', scatter: true },
		{ name: 'L3' },
		{ name: 'H1' },
		{ name: 'S', scatter: true },
		{ name: 'L2' },
		{ name: 'H3' },
		{ name: 'H2' },
	],
	[
		{ name: 'L3' },
		{ name: 'L3' },
		{ name: 'L3' },
		{ name: 'H3' },
		{ name: 'H1' },
		{ name: 'L1' },
		{ name: 'H1' },
		{ name: 'L2' },
		{ name: 'H4' },
	],
];

export const BOARD_DIMENSIONS = { x: INITIAL_BOARD.length, y: INITIAL_BOARD[0].length - 2 };

export const BOARD_SIZES = {
	width: SYMBOL_SIZE * BOARD_DIMENSIONS.x,
	height: SYMBOL_SIZE * BOARD_DIMENSIONS.y,
};

export const BACKGROUND_RATIO = 2039 / 1000;
export const PORTRAIT_BACKGROUND_RATIO = 1242 / 2208;
const PORTRAIT_RATIO = 800 / 1422;
const LANDSCAPE_RATIO = 1600 / 900;
const DESKTOP_RATIO = 1422 / 800;

const DESKTOP_HEIGHT = 800;
const LANDSCAPE_HEIGHT = 900;
const PORTRAIT_HEIGHT = 1422;
export const DESKTOP_MAIN_SIZES = { width: DESKTOP_HEIGHT * DESKTOP_RATIO, height: DESKTOP_HEIGHT };
export const LANDSCAPE_MAIN_SIZES = {
	width: LANDSCAPE_HEIGHT * LANDSCAPE_RATIO,
	height: LANDSCAPE_HEIGHT,
};
export const PORTRAIT_MAIN_SIZES = {
	width: PORTRAIT_HEIGHT * PORTRAIT_RATIO,
	height: PORTRAIT_HEIGHT,
};

export const HIGH_SYMBOLS = ['H1', 'H2', 'H3', 'H4'];
export const LOW_SYMBOLS = ['L1', 'L2', 'L3'];
export const PAYING_SYMBOLS = [...HIGH_SYMBOLS, ...LOW_SYMBOLS];

export const INITIAL_SYMBOL_STATE: SymbolState = 'static';

const SPECIAL_SYMBOL_SIZE = 1;

const SPIN_OPTIONS_SHARED = {
	reelFallInDelay: 6,
	reelPaddingMultiplierNormal: 1,
	reelPaddingMultiplierAnticipated: 18,
	reelFallOutDelay: 8,
};

/** Cluster win highlight — pop before tumble explode (holdMs ≥ popUpMs + popSettleMs). */
export const CLUSTER_HIGHLIGHT = {
	holdMs: 260,
	popUpMs: 152,
	popSettleMs: 105,
	popPeakScale: 1.18,
	popRestScale: 1.06,
	/** Float-up for cluster pay text — independent of symbol pop speed. */
	winAmountFloatMs: 780,
	winAmountTimeoutMs: 880,
	winAmountMultRevealMs: 700,
	winAmountMultCombineDelayMs: 700,
	winAmountMultPopMs: 190,
} as const;

/** Reel spin pacing — cluster tumble uses separate timings in animateBoardTumble. */
export const SPIN_OPTIONS_DEFAULT = {
	...SPIN_OPTIONS_SHARED,
	reelFallInDelay: 10,
	reelFallOutDelay: 12,
	symbolFallInSpeed: 24,
	symbolFallInInterval: 1,
	symbolFallInBounceSpeed: 0.85,
	symbolFallInBounceSizeMulti: 0.24,
	symbolFallOutSpeed: 24,
	symbolFallOutInterval: 1,
};

/** Slow reel land when 2+ scatters tease a bonus on remaining columns. */
export const SPIN_OPTIONS_SCATTER_ANTICIPATION = {
	...SPIN_OPTIONS_SHARED,
	reelPaddingMultiplierNormal: 1.12,
	reelPaddingMultiplierAnticipated: 9,
	reelFallInDelay: 52,
	reelFallOutDelay: 22,
	symbolFallInSpeed: 4.8,
	symbolFallInInterval: 11,
	symbolFallInBounceSpeed: 0.34,
	symbolFallInBounceSizeMulti: 0.3,
	symbolFallOutSpeed: 7.5,
	symbolFallOutInterval: 5,
};

export const SPIN_OPTIONS_FAST = {
	...SPIN_OPTIONS_SHARED,
	reelFallInDelay: 2,
	reelFallOutDelay: 4,
	symbolFallInSpeed: 44,
	symbolFallInInterval: 0,
	symbolFallInBounceSpeed: 1.2,
	symbolFallInBounceSizeMulti: 0.22,
	symbolFallOutSpeed: 44,
	symbolFallOutInterval: 0,
};

/** Mobile base game — portrait / stacked only. */
export const SPIN_OPTIONS_MOBILE_DEFAULT = {
	...SPIN_OPTIONS_SHARED,
	reelPaddingMultiplierNormal: 1,
	reelFallInDelay: 5,
	reelFallOutDelay: 7,
	symbolFallInSpeed: 32,
	symbolFallInInterval: 1,
	symbolFallInBounceSpeed: 1,
	symbolFallInBounceSizeMulti: 0.24,
	symbolFallOutSpeed: 32,
	symbolFallOutInterval: 1,
};

export const SPIN_OPTIONS_MOBILE_FAST = {
	...SPIN_OPTIONS_SHARED,
	reelPaddingMultiplierNormal: 1,
	reelFallInDelay: 2,
	reelFallOutDelay: 4,
	symbolFallInSpeed: 44,
	symbolFallInInterval: 0,
	symbolFallInBounceSpeed: 1.2,
	symbolFallInBounceSizeMulti: 0.22,
	symbolFallOutSpeed: 44,
	symbolFallOutInterval: 0,
};

export const MOTION_BLUR_VELOCITY = 31;

export const zIndexes = {
	background: {
		backdrop: -3,
		normal: -2,
		feature: -1,
	},
};

const explosion = {
	type: 'spine',
	assetKey: 'explosion',
	animationName: 'explosion',
	sizeRatios: { width: 0.82, height: 0.82 },
};

const highSymbolSize = { width: 0.95, height: 0.95 };
const makeHighStatic = (assetKey: string) => ({
	type: 'sprite' as const,
	assetKey,
	sizeRatios: highSymbolSize,
});
const makeHighSymbol = (assetKey: string) => {
	const symbol = makeHighStatic(assetKey);
	return {
		explosion,
		win: symbol,
		postWinStatic: symbol,
		static: symbol,
		spin: symbol,
		land: symbol,
	};
};

const scatterSizeRatios = { width: 1.14, height: 1.14 };
const sStatic = { type: 'sprite', assetKey: 'starpetalS', sizeRatios: scatterSizeRatios };
const wStatic = { type: 'sprite', assetKey: 'starpetalW', sizeRatios: { width: 1.18, height: 1.18 } };

const multiplierSizeRatios = { width: 0.92, height: 0.92 };
const makeMultiplierStatic = (assetKey: string) => ({
	type: 'sprite' as const,
	assetKey,
	sizeRatios: multiplierSizeRatios,
});
const makeMultiplierSymbol = (assetKey: string) => {
	const symbol = makeMultiplierStatic(assetKey);
	return {
		explosion,
		win: symbol,
		postWinStatic: symbol,
		static: symbol,
		spin: symbol,
		land: symbol,
	};
};

/** Rotated art: H1←L3, H2←H1, H3←H2, H4←H3, L2←L1, L3←L2, L1←H4 */
export const SYMBOL_INFO_MAP = {
	H1: makeHighSymbol('starpetalL3'),
	H2: makeHighSymbol('starpetalH1'),
	H3: makeHighSymbol('starpetalH2'),
	H4: makeHighSymbol('starpetalH3'),
	L1: makeHighSymbol('starpetalH4'),
	L2: makeHighSymbol('starpetalL1'),
	L3: makeHighSymbol('starpetalL2'),
	// Legacy math aliases — map retired IDs to the 7-symbol set
	H5: makeHighSymbol('starpetalH4'),
	H6: makeHighSymbol('starpetalL1'),
	H7: makeHighSymbol('starpetalL2'),
	L4: makeHighSymbol('starpetalL2'),
	W: {
		explosion,
		win: wStatic,
		postWinStatic: wStatic,
		static: wStatic,
		spin: wStatic,
		land: wStatic,
	},
	S: {
		explosion,
		postWinStatic: sStatic,
		static: sStatic,
		spin: sStatic,
		win: sStatic,
		land: sStatic,
	},
	M_2: makeMultiplierSymbol('starpetalM2'),
	M_4: makeMultiplierSymbol('starpetalM4'),
	M_8: makeMultiplierSymbol('starpetalM8'),
	M_16: makeMultiplierSymbol('starpetalM16'),
	M_32: makeMultiplierSymbol('starpetalM32'),
	M_64: makeMultiplierSymbol('starpetalM64'),
	M_128: makeMultiplierSymbol('starpetalM128'),
	M_256: makeMultiplierSymbol('starpetalM256'),
	M_512: makeMultiplierSymbol('starpetalM512'),
	M_250: makeMultiplierSymbol('starpetalM256'),
} as const;

export const SCATTER_LAND_SOUND_MAP = {
	1: 'sfx_scatter_stop_1',
	2: 'sfx_scatter_stop_2',
	3: 'sfx_scatter_stop_3',
	4: 'sfx_scatter_stop_4',
	5: 'sfx_scatter_stop_5',
} as const;
