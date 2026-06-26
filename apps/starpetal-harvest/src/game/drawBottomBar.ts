import type { Graphics } from 'pixi.js';

import { drawVinePanelBorder, fillVinePanelBackground } from './drawVineReelFrame';
import { THEME } from './theme';

const BOTTOM_BAR_PEAK_H = 8;
const BOTTOM_BAR_FRAME_INSET = 5;

/** Full-width control bar — same hex vine + dark grove fill as the slot / tumble panels. */
export const drawBottomBarBackground = (
	g: Graphics,
	width: number,
	height: number,
	glow = false,
) => {
	const hw = width / 2;
	const hh = height / 2;
	const top = -hh;
	const bottom = hh;

	g.clear();
	fillVinePanelBackground(g, {
		hw,
		top,
		bottom,
		peakH: BOTTOM_BAR_PEAK_H,
		frameInset: BOTTOM_BAR_FRAME_INSET,
		glow,
	});
	drawVinePanelBorder(g, {
		hw,
		top,
		bottom,
		peakH: BOTTOM_BAR_PEAK_H,
		frameInset: BOTTOM_BAR_FRAME_INSET,
		glow,
	});
};

export const drawBottomBarAmountCell = (
	g: Graphics,
	width: number,
	height: number,
) => {
	const hw = width / 2;
	const hh = height / 2;
	const inset = 3;
	const innerW = width - inset * 2;
	const innerH = height - inset * 2;

	g.clear();
	g.rect(-hw + inset, -hh + inset, innerW, innerH);
	g.fill({ color: THEME.bgMid, alpha: 0.5 });
	g.rect(-hw + inset, -hh + inset, innerW, innerH);
	g.fill({ color: THEME.bgGlow, alpha: 0.3 });
	g.rect(-hw + inset, -hh + inset, innerW, innerH);
	g.stroke({ color: THEME.vine, width: 1.25, alpha: 0.45 });
};