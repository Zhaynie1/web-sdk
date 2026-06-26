import { BOARD_DIMENSIONS } from './constants';

/** Matches the tinted shadow panel inside BoardFrame.svelte */
export const BOARD_FRAME_WIDTH_SCALE = 1.12;
export const BOARD_FRAME_INSET = 5;

export type BoardLayoutRect = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export function getBoardInnerFrame(layout: BoardLayoutRect) {
	const innerW = layout.width * BOARD_FRAME_WIDTH_SCALE - BOARD_FRAME_INSET * 2;
	const innerH = layout.height - BOARD_FRAME_INSET * 2;
	const columnWidth = innerW / BOARD_DIMENSIONS.x;
	const left = layout.x - innerW / 2;
	const top = layout.y - innerH / 2;

	return {
		innerW,
		innerH,
		columnWidth,
		left,
		top,
		columnCenterX: (reelIndex: number) => left + (reelIndex + 0.5) * columnWidth,
	};
}