import { MIN_BET } from './betConfig';
import { isSocialMode, socialLabels } from './socialWording';

export const MIN_CLUSTER_SIZE = 5;

export type PayTier = {
	label: string;
	multiplier: number;
};

export type PayTablePayingSymbol = {
	id: string;
	image: string;
	tiers: PayTier[];
};

export type PayTableScatterSymbol = {
	id: string;
	image: string;
	lines: string[];
};

const SYMBOL_IMAGES: Record<string, string> = {
	H1: new URL('../../assets/sprites/starpetal/l3_grove_bloom.png', import.meta.url).href,
	H2: new URL('../../assets/sprites/starpetal/h1_starpetal.png', import.meta.url).href,
	H3: new URL('../../assets/sprites/starpetal/h2_cosmic_wasp.png', import.meta.url).href,
	H4: new URL('../../assets/sprites/starpetal/h3_lunar_fox.png', import.meta.url).href,
	L1: new URL('../../assets/sprites/starpetal/h4_aurora_butterfly.png', import.meta.url).href,
	L2: new URL('../../assets/sprites/starpetal/l1_dewdrop.png', import.meta.url).href,
	L3: new URL('../../assets/sprites/starpetal/l2_starfall_leaf.png', import.meta.url).href,
	S: new URL('../../assets/sprites/starpetal/s_falling_star.png', import.meta.url).href,
	W: new URL('../../assets/sprites/starpetal/w_glowing_vine_wild.png', import.meta.url).href,
};

const PAYING_SYMBOL_ORDER = ['H1', 'H2', 'H3', 'H4', 'L1', 'L2', 'L3'] as const;

const CLUSTER_SIZES = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const;

/** Exact payout ladder per symbol at the $0.20 reference bet. */
const PAY_AT_MIN_BET_BY_SYMBOL: Record<
	(typeof PAYING_SYMBOL_ORDER)[number],
	Record<(typeof CLUSTER_SIZES)[number], number>
> = {
	H1: { 5: 0.2, 6: 0.3, 7: 0.35, 8: 0.4, 9: 0.5, 10: 1.0, 11: 1.5, 12: 3.0, 13: 7.0, 14: 14.0, 15: 30.0 },
	H2: { 5: 0.15, 6: 0.2, 7: 0.25, 8: 0.3, 9: 0.4, 10: 0.8, 11: 1.2, 12: 2.5, 13: 6.0, 14: 12.0, 15: 20.0 },
	H3: { 5: 0.1, 6: 0.15, 7: 0.2, 8: 0.25, 9: 0.3, 10: 0.6, 11: 0.9, 12: 2.0, 13: 5.0, 14: 10.0, 15: 18.0 },
	H4: { 5: 0.08, 6: 0.1, 7: 0.15, 8: 0.2, 9: 0.25, 10: 0.4, 11: 0.6, 12: 1.0, 13: 4.0, 14: 8.0, 15: 16.0 },
	L1: { 5: 0.06, 6: 0.08, 7: 0.1, 8: 0.15, 9: 0.2, 10: 0.3, 11: 0.5, 12: 0.7, 13: 3.0, 14: 6.0, 15: 12.0 },
	L2: { 5: 0.05, 6: 0.06, 7: 0.08, 8: 0.1, 9: 0.15, 10: 0.25, 11: 0.4, 12: 0.6, 13: 2.0, 14: 4.0, 15: 8.0 },
	L3: { 5: 0.04, 6: 0.05, 7: 0.06, 8: 0.08, 9: 0.1, 10: 0.2, 11: 0.3, 12: 0.5, 13: 1.0, 14: 2.0, 15: 4.0 },
};

const payMultiplierForSize = (
	symbolId: (typeof PAYING_SYMBOL_ORDER)[number],
	clusterSize: number,
): number | null => {
	if (clusterSize < MIN_CLUSTER_SIZE) return null;
	const cappedSize = Math.min(clusterSize, 15) as (typeof CLUSTER_SIZES)[number];
	return PAY_AT_MIN_BET_BY_SYMBOL[symbolId][cappedSize] / MIN_BET;
};

/** Bet multiplier for a paying-symbol cluster (5–15+ uses the 15+ tier). */
export const getClusterPayMultiplier = (symbolId: string, clusterSize: number): number | null => {
	if (!(PAYING_SYMBOL_ORDER as readonly string[]).includes(symbolId)) return null;
	return payMultiplierForSize(symbolId as (typeof PAYING_SYMBOL_ORDER)[number], clusterSize);
};

const buildTiers = (symbolId: (typeof PAYING_SYMBOL_ORDER)[number]): PayTier[] =>
	[...CLUSTER_SIZES].reverse().map((size) => ({
		label: size === 15 ? '15+' : `${size}`,
		multiplier: PAY_AT_MIN_BET_BY_SYMBOL[symbolId][size] / MIN_BET,
	}));

export const PAYTABLE_PAYING_SYMBOLS: PayTablePayingSymbol[] = PAYING_SYMBOL_ORDER.map((id) => ({
	id,
	image: SYMBOL_IMAGES[id],
	tiers: buildTiers(id),
}));

export const getPaytableScatter = (): PayTableScatterSymbol => {
	const social = isSocialMode();
	const mysteryFeature = socialLabels.mysteryFeature();
	const wagerNoun = socialLabels.wagerNoun();

	return {
		id: 'S',
		image: SYMBOL_IMAGES.S,
		lines: [
			'This is the SCATTER symbol.',
			'SCATTER symbol appears on all reels.',
			'During free spins, 3 SCATTER symbols retrigger +8 spins and 4 SCATTER symbols retrigger +10 spins (2 scatters do not retrigger).',
			'Starpetal Mystery retriggers follow the same rules but are ultra rare.',
			'3 SCATTER symbols trigger Starpetal Harvest (10 free spins).',
			'4 SCATTER symbols trigger Starpetal Awakening (12 free spins; 18 starting 2× underlying tiles, tile multipliers up to 512×).',
			'5 SCATTER symbols trigger Starpetal Mystery (15 free spins; every cell starts at 2×, dewdrop multipliers apply, and a 256× dewdrop is guaranteed to hit at least once).',
			social
				? `${mysteryFeature} (1,000× ${wagerNoun}): 60% Starpetal Harvest, 30% Starpetal Awakening, 10% full Starpetal Mystery.`
				: 'Mystery Buy (1,000× bet): 60% Starpetal Harvest, 30% Starpetal Awakening, 10% full Starpetal Mystery.',
		],
	};
};

export const getPaytableIntro = () => {
	const social = isSocialMode();
	return social
		? `All symbols win in blocks of minimum ${MIN_CLUSTER_SIZE} symbols connected horizontally or vertically.`
		: `All symbols pay in blocks of minimum ${MIN_CLUSTER_SIZE} symbols connected horizontally or vertically.`;
};