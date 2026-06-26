import type { Bet } from './typesBookEvent';

/**
 * Natural base-game bonus: ~1 hit every 400 spins on average (not exactly 400).
 * When a bonus hits, tier split is 70% standard / 20% awakening / 10% mystery.
 */
export const BASE_BONUS_TRIGGER_CHANCE = 1 / 400;

export const BONUS_VARIANT_WEIGHTS = [
	{ category: 'freegame', weight: 0.7 },
	{ category: 'freegame_awakening', weight: 0.2 },
	{ category: 'freegame_mystery', weight: 0.1 },
] as const;

/** Non-bonus base spins (zero / base win / wincap). */
export const BASE_NON_BONUS_QUOTAS = [
	{ category: 'zero', quota: 0.38 },
	{ category: 'wincap', quota: 0.001 },
	{
		category: 'basegame',
		quota: 1 - BASE_BONUS_TRIGGER_CHANCE - 0.38 - 0.001,
	},
] as const;

/** Flattened quotas — mirrors `game_config.py` for Stake math. */
export const BASE_SPIN_QUOTAS = [
	...BASE_NON_BONUS_QUOTAS,
	{
		category: 'freegame',
		quota: BASE_BONUS_TRIGGER_CHANCE * BONUS_VARIANT_WEIGHTS[0].weight,
	},
	{
		category: 'freegame_awakening',
		quota: BASE_BONUS_TRIGGER_CHANCE * BONUS_VARIANT_WEIGHTS[1].weight,
	},
	{
		category: 'freegame_mystery',
		quota: BASE_BONUS_TRIGGER_CHANCE * BONUS_VARIANT_WEIGHTS[2].weight,
	},
] as const;

export type BaseBookCategory = (typeof BASE_SPIN_QUOTAS)[number]['category'];

const hasClusterWins = (book: Bet & { events?: Bet['state'] }) =>
	(book.events ?? book.state ?? []).some((event) => event.type === 'winInfo');

const getFreeSpinTrigger = (book: Bet & { events?: Bet['state'] }) => {
	const events = book.events ?? book.state ?? [];
	return events.find((event) => event.type === 'freeSpinTrigger');
};

export const getBaseBookCategory = (book: Bet & { events?: Bet['state'] }): BaseBookCategory => {
	const trigger = getFreeSpinTrigger(book);
	if (trigger && trigger.type === 'freeSpinTrigger') {
		const variant = trigger.bonusVariant ?? 'standard';
		if (variant === 'awakening') return 'freegame_awakening';
		if (variant === 'mystery') return 'freegame_mystery';
		return 'freegame';
	}

	if (book.payoutMultiplier >= 25_000 * 100) return 'wincap';

	if (book.payoutMultiplier > 0 || hasClusterWins(book)) return 'basegame';

	return 'zero';
};

export const pickWeightedCategory = (
	quotas: ReadonlyArray<{ category: string; quota: number }>,
): string => {
	const roll = Math.random();
	let cumulative = 0;

	for (const entry of quotas) {
		cumulative += entry.quota;
		if (roll < cumulative) return entry.category;
	}

	return quotas[quotas.length - 1]?.category ?? 'basegame';
};

/** Step 1: ~1/400 bonus. Step 2 (if bonus): 70% / 20% / 10% tier split. */
export const pickBaseSpinCategory = (): BaseBookCategory => {
	if (Math.random() < BASE_BONUS_TRIGGER_CHANCE) {
		const variantRoll = Math.random();
		let cumulative = 0;

		for (const entry of BONUS_VARIANT_WEIGHTS) {
			cumulative += entry.weight;
			if (variantRoll < cumulative) return entry.category;
		}

		return 'freegame';
	}

	return pickWeightedCategory(BASE_NON_BONUS_QUOTAS) as BaseBookCategory;
};

/** Average spins: any bonus ~400; tier rates are shares of that 1/400 window. */
export const BASE_BONUS_HIT_AVERAGES = {
	any: Math.round(1 / BASE_BONUS_TRIGGER_CHANCE),
	standard: Math.round(1 / (BASE_BONUS_TRIGGER_CHANCE * BONUS_VARIANT_WEIGHTS[0].weight)),
	awakening: Math.round(1 / (BASE_BONUS_TRIGGER_CHANCE * BONUS_VARIANT_WEIGHTS[1].weight)),
	mystery: Math.round(1 / (BASE_BONUS_TRIGGER_CHANCE * BONUS_VARIANT_WEIGHTS[2].weight)),
} as const;