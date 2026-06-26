import { VISIBLE_ROW_END, VISIBLE_ROW_START } from './evaluateBoardClusters';
import type { RawSymbol } from './types';

export const SCATTER_ANTICIPATION_MIN = 2;

/** Only the dedicated scatter symbol counts — never multipliers or other cells with a stray flag. */
export const isScatterSymbol = (cell: RawSymbol | undefined) => cell?.name === 'S';

export const countScattersOnReel = (reel: RawSymbol[]): number => {
	let count = 0;
	for (let row = VISIBLE_ROW_START; row <= VISIBLE_ROW_END; row++) {
		if (isScatterSymbol(reel[row])) count += 1;
	}
	return count;
};

export const countVisibleScatters = (board: RawSymbol[][]): number =>
	board.reduce((total, reel) => total + countScattersOnReel(reel), 0);

/**
 * Build per-reel anticipation tiers: once 2+ scatters are visible on reels to the left,
 * remaining reels get increasing delay (1, 2, 3…) for trail + slow land.
 */
export const buildScatterAnticipation = (board: RawSymbol[][]): number[] => {
	const anticipation = board.map(() => 0);
	let scatterCount = 0;
	let tier = 0;

	for (let reelIndex = 0; reelIndex < board.length; reelIndex++) {
		if (scatterCount >= SCATTER_ANTICIPATION_MIN) {
			tier += 1;
			anticipation[reelIndex] = tier;
		}
		scatterCount += countScattersOnReel(board[reelIndex]);
	}

	return anticipation;
};

/** Resolve anticipation from visible scatter positions on the landing board (2+ scatters). */
export const resolveScatterAnticipation = ({
	board,
}: {
	board: RawSymbol[][];
	bookAnticipation?: number[];
}): { anticipation: number[] } => {
	const anticipation = buildScatterAnticipation(board);
	return { anticipation };
};