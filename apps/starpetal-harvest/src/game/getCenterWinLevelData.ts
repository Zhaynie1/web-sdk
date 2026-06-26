import { SECOND } from 'constants-shared/time';

import { MAX_WIN_MULTIPLIER } from './theme';
import { winLevelMap, type WinLevel, type WinLevelData } from './winLevelMap';

/** Cap long tiers (SUPER WIN, etc.) so click-skip and auto-advance stay responsive. */
export const capWinPresentDuration = (duration: number, maxMs = 5 * SECOND) =>
	Math.min(duration, maxMs);

/** Book amount ÷ 100 = win as a multiple of the wagered bet. */
export const bookAmountToBetMultiple = (amount: number) => amount / 100;

/** Minimum bet-multiple before a base-game center win popup. */
export const CENTER_WIN_MIN_MULTIPLE = 5;

export const getCenterWinLevel = (amount: number): WinLevel | null => {
	const mult = bookAmountToBetMultiple(amount);
	if (mult < CENTER_WIN_MIN_MULTIPLE) return null;
	if (mult < 20) return 4;
	if (mult < 100) return 6;
	if (mult < MAX_WIN_MULTIPLIER) return 8;
	return 10;
};

export const getCenterWinLevelData = (amount: number): WinLevelData | null => {
	const level = getCenterWinLevel(amount);
	return level ? winLevelMap[level] : null;
};

/**
 * Merge book winLevel with amount-based UI tiers.
 * Math books often emit level 5 (5–15×) which has no label; starpetal maps 5–19× to NICE WIN.
 */
export const resolveSetWinLevelData = (bookEvent: {
	winLevel: number;
	amount: number;
}): WinLevelData | null => {
	const bookLevelData = winLevelMap[bookEvent.winLevel as WinLevel];
	const amountLevelData = getCenterWinLevelData(bookEvent.amount);

	const bookTier = bookLevelData?.level ?? 0;
	const amountTier = amountLevelData?.level ?? 0;
	const effectiveTier = Math.max(bookTier, amountTier);

	if (effectiveTier < 4) return null;

	const effectiveLevel = effectiveTier as WinLevel;
	const data = winLevelMap[effectiveLevel];

	// Level 5 (substantial) celebrates but uses the NICE WIN presentation.
	if (data?.level === 5) return winLevelMap[4];

	return data ?? null;
};

/** Bonus outro always shows a center popup for any positive total. */
export const getFeatureEndWinLevelData = (amount: number): WinLevelData | null => {
	if (amount <= 0) return null;
	const level = getCenterWinLevel(amount) ?? (4 as WinLevel);
	return winLevelMap[level];
};

/** End-of-bonus total screen — always labeled TOTAL WIN with a skippable count-up. */
export const getFreeSpinOutroWinLevelData = (bookEvent: {
	winLevel: number;
	amount: number;
}): WinLevelData | null => {
	const base =
		winLevelMap[bookEvent.winLevel as WinLevel] ?? getFeatureEndWinLevelData(bookEvent.amount);
	if (!base) return null;

	return {
		...base,
		text: 'TOTAL WIN',
		presentDuration: capWinPresentDuration(base.presentDuration),
	};
};