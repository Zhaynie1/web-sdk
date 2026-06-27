import type { Graphics } from 'pixi.js';

import { THEME } from '$starpetal/config/theme';
import { drawVinePanelBorder, fillVinePanelBackground } from './drawVineReelFrame';

/**
 * Procedural vine win plaque — the hex grove fill + wood wreath matching the reel
 * frame and bottom bar.
 *
 * NOTE: the win/free-spin panels currently use the `starpetalWinFrame` sprite
 * (see WinFrameDisplay.svelte). This procedural alternative is kept available so
 * the panels can be switched back to the drawn vine window if preferred — swap the
 * `<Sprite>` in WinFrameDisplay for a `<Graphics draw={(g) => drawVineWinPanel(...)} />`.
 */
const WIN_PANEL_PEAK_H = 14;
const WIN_PANEL_FRAME_INSET = 8;
const COMPACT_PANEL_PEAK_H = 8;
const COMPACT_PANEL_FRAME_INSET = 5;

export type VineWinPanelOpts = {
	glow?: boolean;
	/** Opaque grove fill instead of layered translucent panels. */
	solid?: boolean;
	/** Tighter hex peaks + thinner vine trim. */
	compact?: boolean;
};

const fillSolidVinePanelBackground = (
	g: Graphics,
	opts: {
		hw: number;
		top: number;
		bottom: number;
		peakH: number;
		frameInset: number;
	},
) => {
	const { hw, top, bottom, peakH, frameInset } = opts;
	const innerHw = hw - frameInset;
	const innerTop = top + frameInset;
	const innerW = hw * 2 - frameInset * 2;
	const innerH = bottom - top - frameInset * 2;

	g.moveTo(-hw, top);
	g.lineTo(0, top - peakH);
	g.lineTo(hw, top);
	g.lineTo(hw, bottom);
	g.lineTo(0, bottom + peakH);
	g.lineTo(-hw, bottom);
	g.closePath();
	g.fill({ color: THEME.bgDeep, alpha: 1 });

	g.rect(-innerHw, innerTop, innerW, innerH);
	g.fill({ color: THEME.bgMid, alpha: 1 });
};

/** Hex vine win plaque — same grove fill + wood wreath as the reel / bottom bar. */
export const drawVineWinPanel = (
	g: Graphics,
	width: number,
	height: number,
	opts: VineWinPanelOpts | boolean = false,
) => {
	const resolved = typeof opts === 'boolean' ? ({ glow: opts } satisfies VineWinPanelOpts) : opts;
	const { glow = false, solid = false, compact = false } = resolved;

	const peakH = compact ? COMPACT_PANEL_PEAK_H : WIN_PANEL_PEAK_H;
	const frameInset = compact ? COMPACT_PANEL_FRAME_INSET : WIN_PANEL_FRAME_INSET;
	const hw = width / 2;
	const hh = height / 2;
	const top = -hh;
	const bottom = hh;

	g.clear();

	if (solid) {
		fillSolidVinePanelBackground(g, { hw, top, bottom, peakH, frameInset });
	} else {
		fillVinePanelBackground(g, {
			hw,
			top,
			bottom,
			peakH,
			frameInset,
			glow,
			contained: true,
		});
	}

	drawVinePanelBorder(g, {
		hw,
		top,
		bottom,
		peakH,
		frameInset,
		glow: solid ? false : glow,
	});
};
