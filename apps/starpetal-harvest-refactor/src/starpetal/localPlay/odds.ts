/**
 * Local-play bonus odds — restores the original math so offline play matches the
 * intended rates: a natural base-game bonus roughly every 1 in 400 spins, and when
 * one hits, a 70% / 20% / 10% split across standard (Starpetal Harvest) /
 * awakening (Super Bonus) / mystery. Mirrors the original localPlayOdds.ts.
 */
type OddsBook = {
	events?: Array<{ type?: string; bonusVariant?: string }>;
	payoutMultiplier?: number;
};

export const BASE_BONUS_TRIGGER_CHANCE = 1 / 400;

const BONUS_VARIANT_WEIGHTS = [
	{ category: 'freegame', weight: 0.7 },
	{ category: 'freegame_awakening', weight: 0.2 },
	{ category: 'freegame_mystery', weight: 0.1 },
] as const;

/** Non-bonus base spins (zero / base win / wincap). */
const BASE_NON_BONUS_QUOTAS = [
	{ category: 'zero', quota: 0.38 },
	{ category: 'wincap', quota: 0.001 },
	{ category: 'basegame', quota: 1 - BASE_BONUS_TRIGGER_CHANCE - 0.38 - 0.001 },
] as const;

const getFreeSpinTrigger = (book: OddsBook) =>
	(book.events ?? []).find((event) => event.type === 'freeSpinTrigger');

/** Bucket a base book by its outcome so spins can be drawn to match the quotas. */
export const getBaseBookCategory = (book: OddsBook): string => {
	const trigger = getFreeSpinTrigger(book);
	if (trigger) {
		const variant = trigger.bonusVariant ?? 'standard';
		if (variant === 'awakening') return 'freegame_awakening';
		if (variant === 'mystery') return 'freegame_mystery';
		return 'freegame';
	}

	const payout = book.payoutMultiplier ?? 0;
	if (payout >= 25_000 * 100) return 'wincap';
	if (payout > 0 || (book.events ?? []).some((event) => event.type === 'winInfo')) return 'basegame';
	return 'zero';
};

/** Step 1: ~1/400 chance of a bonus. Step 2 (if bonus): 70/20/10 tier split. */
export const pickBaseSpinCategory = (): string => {
	if (Math.random() < BASE_BONUS_TRIGGER_CHANCE) {
		const roll = Math.random();
		let cumulative = 0;
		for (const entry of BONUS_VARIANT_WEIGHTS) {
			cumulative += entry.weight;
			if (roll < cumulative) return entry.category;
		}
		return 'freegame';
	}

	const roll = Math.random();
	let cumulative = 0;
	for (const entry of BASE_NON_BONUS_QUOTAS) {
		cumulative += entry.quota;
		if (roll < cumulative) return entry.category;
	}
	return 'basegame';
};
