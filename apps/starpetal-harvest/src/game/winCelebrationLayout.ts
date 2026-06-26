import type { WinLevelData } from './winLevelMap';

/** Win plaque width relative to the game board. */
export const WIN_CELEBRATION_FRAME_SCALE = 0.52;

export const getWinCelebrationFrameWidth = (boardWidth: number) =>
	Math.round(boardWidth * WIN_CELEBRATION_FRAME_SCALE);

/** Vine wreath glow — matches the reel frame pulse on wins. */
export const getWinCelebrationGlow = (data: WinLevelData) => data.type === 'big';