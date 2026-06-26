import { BOARD_SIZES, SYMBOL_SIZE } from './constants';
import { VISIBLE_ROW_END, VISIBLE_ROW_START } from './evaluateBoardClusters';
import { getSymbolX, getSymbolY } from './utils';

/** Layout in BoardContainer local coords — one reel column aligned to visible symbol cells. */
export function getAnticipationLayout(reelIndex: number) {
	const topRowIndex = VISIBLE_ROW_START - 1;
	const bottomRowIndex = VISIBLE_ROW_END - 1;
	const topY = getSymbolY(topRowIndex) - SYMBOL_SIZE * 0.5;
	const bottomY = getSymbolY(bottomRowIndex) + SYMBOL_SIZE * 0.5;

	return {
		x: getSymbolX(reelIndex),
		y: topY,
		width: SYMBOL_SIZE,
		height: bottomY - topY || BOARD_SIZES.height,
	};
}