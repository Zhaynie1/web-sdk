/** Displayed max-win cap (all bet modes). */
export const MAX_WIN_MULTIPLIER = 25_000;
export const MAX_WIN_AMOUNT_LABEL = `${MAX_WIN_MULTIPLIER.toLocaleString('en-US')}×`;
export const MAX_WIN_CAP_LABEL = 'MAX WIN';

/** Starpetal Forest — twilight grove palette */
export const THEME = {
	bgDeep: 0x0a0618,
	bgMid: 0x14102a,
	bgGlow: 0x2a1848,
	aurora: 0x7b5cff,
	starlight: 0xf4e8ff,
	petal: 0xff9ecf,
	bloom: 0xffd4a8,
	vine: 0x5ce0a8,
	dew: 0x8ee8ff,
	mist: 0xc8b8e8,
	frame: 0x3d2a5c,
	frameGlow: 0x9d7aff,
	gold: 0xffd87a,
	silver: 0xd8e4f5,
	silverStroke: 0x2a3448,
} as const;

export const SYMBOL_LABELS: Record<string, string> = {
	H1: 'Starpetal',
	H2: 'Cosmic Wasp',
	H3: 'Lunar Fox',
	H4: 'Aurora Butterfly',
	L1: 'Cosmic Dewdrop',
	L2: 'Starfall Leaf',
	L3: 'Grove Bloom',
	S: 'Falling Star',
};

export const SYMBOL_TINTS: Record<string, number> = {
	H1: 0xffffff,
	H2: 0xffffff,
	H3: 0xffffff,
	H4: 0xffffff,
	L1: 0xffffff,
	L2: 0xffffff,
	L3: 0xffffff,
	S: 0xffffff,
};