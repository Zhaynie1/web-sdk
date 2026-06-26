import type { Graphics } from 'pixi.js';

import { THEME } from './theme';

const WOOD = {
	shadow: 0x2a1508,
	bark: 0x4a2c18,
	mid: 0x6b4428,
	highlight: 0xc9a45c,
	moss: 0x3d5c34,
} as const;

/** Dark vine trim — layered black for crisp edges on the wood */
const VINE_ACCENT = {
	deep: 0x000000,
	mid: 0x0a0a0a,
	bright: 0x141414,
	edge: 0x2a2a2a,
} as const;

const vineAccentLayers = (glow: boolean, baseWidth: number) => [
	{ color: VINE_ACCENT.deep, width: baseWidth + 1.2, alpha: glow ? 0.92 : 0.78 },
	{ color: VINE_ACCENT.mid, width: baseWidth, alpha: glow ? 0.96 : 0.85 },
	{ color: VINE_ACCENT.bright, width: baseWidth * 0.62, alpha: glow ? 1 : 0.9 },
	{ color: VINE_ACCENT.edge, width: baseWidth * 0.28, alpha: glow ? 0.55 : 0.35 },
];

type VineFrameOpts = {
	hw: number;
	hh: number;
	peakH: number;
	frameInset: number;
	innerHw: number;
	innerHh: number;
	innerW: number;
	innerH: number;
	glow: boolean;
};

const drawVineSegment = (
	g: Graphics,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	bulge: number,
	glow: boolean,
) => {
	const mx = (x1 + x2) * 0.5;
	const my = (y1 + y2) * 0.5;
	const dx = x2 - x1;
	const dy = y2 - y1;
	const len = Math.hypot(dx, dy) || 1;
	const nx = -dy / len;
	const ny = dx / len;
	const cx = mx + nx * bulge;
	const cy = my + ny * bulge;

	const vineAccent = vineAccentLayers(glow, 2.4);
	const layers: { color: number; width: number; alpha: number; offset: number }[] = [
		{ color: WOOD.shadow, width: 10, alpha: 0.82, offset: 0 },
		{ color: WOOD.bark, width: 7, alpha: 0.96, offset: 0.6 },
		{ color: WOOD.mid, width: 5, alpha: 0.92, offset: 1.2 },
		{ color: WOOD.highlight, width: 2.2, alpha: 0.7, offset: 2 },
		...vineAccent.map((layer, index) => ({ ...layer, offset: 2.4 + index * 0.22 })),
	];

	for (const layer of layers) {
		g.moveTo(x1 + nx * layer.offset, y1 + ny * layer.offset);
		g.quadraticCurveTo(
			cx + nx * layer.offset,
			cy + ny * layer.offset,
			x2 + nx * layer.offset,
			y2 + ny * layer.offset,
		);
		g.stroke({
			color: layer.color,
			width: layer.width,
			alpha: layer.alpha,
			cap: 'round',
			join: 'round',
		});
	}
};

const drawMysticLeaf = (
	g: Graphics,
	x: number,
	y: number,
	angle: number,
	scale: number,
	glow: boolean,
) => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const tipX = x + cos * 14 * scale;
	const tipY = y + sin * 14 * scale;
	const leftX = x + Math.cos(angle + 1.4) * 9 * scale;
	const leftY = y + Math.sin(angle + 1.4) * 9 * scale;
	const rightX = x + Math.cos(angle - 1.4) * 9 * scale;
	const rightY = y + Math.sin(angle - 1.4) * 9 * scale;

	g.moveTo(x, y);
	g.quadraticCurveTo(leftX, leftY, tipX, tipY);
	g.quadraticCurveTo(rightX, rightY, x, y);
	g.closePath();
	g.fill({ color: WOOD.moss, alpha: 0.55 });
	g.fill({ color: VINE_ACCENT.deep, alpha: glow ? 0.72 : 0.55 });
	g.stroke({ color: WOOD.bark, width: 1.2, alpha: 0.85 });
	g.stroke({ color: VINE_ACCENT.mid, width: 0.7, alpha: glow ? 0.95 : 0.75 });

	g.circle(tipX, tipY, 2.2 * scale);
	g.fill({ color: VINE_ACCENT.deep, alpha: glow ? 0.95 : 0.8 });
};

const drawCornerTendril = (g: Graphics, x: number, y: number, angle: number, glow: boolean) => {
	const len = 22;
	const endX = x + Math.cos(angle) * len;
	const endY = y + Math.sin(angle) * len;
	const ctrlX = x + Math.cos(angle + 0.55) * len * 0.65;
	const ctrlY = y + Math.sin(angle + 0.55) * len * 0.65;

	g.moveTo(x, y);
	g.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
	g.stroke({ color: WOOD.bark, width: 3.5, alpha: 0.9, cap: 'round' });
	for (const layer of vineAccentLayers(glow, 1.6)) {
		g.moveTo(x, y);
		g.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
		g.stroke({ color: layer.color, width: layer.width, alpha: layer.alpha, cap: 'round' });
	}

	drawMysticLeaf(g, endX, endY, angle + 0.35, 0.85, glow);
};

type VineHexCorners = {
	topLeft: { x: number; y: number };
	topRight: { x: number; y: number };
	bottomRight: { x: number; y: number };
	bottomLeft: { x: number; y: number };
	topPeak: { x: number; y: number };
	bottomPeak: { x: number; y: number };
};

type VineInnerRect = {
	innerHw: number;
	innerTop: number;
	innerBottom: number;
	innerW: number;
};

const drawVineHexWreath = (g: Graphics, corners: VineHexCorners, inner: VineInnerRect, glow: boolean) => {
	const { topLeft, topRight, bottomRight, bottomLeft, topPeak, bottomPeak } = corners;
	const { innerHw, innerTop, innerBottom, innerW } = inner;

	drawVineSegment(g, topLeft.x, topLeft.y, topPeak.x, topPeak.y, -18, glow);
	drawVineSegment(g, topPeak.x, topPeak.y, topRight.x, topRight.y, -18, glow);
	drawVineSegment(g, topRight.x, topRight.y, bottomRight.x, bottomRight.y, 22, glow);
	drawVineSegment(g, bottomRight.x, bottomRight.y, bottomPeak.x, bottomPeak.y, 18, glow);
	drawVineSegment(g, bottomPeak.x, bottomPeak.y, bottomLeft.x, bottomLeft.y, 18, glow);
	drawVineSegment(g, bottomLeft.x, bottomLeft.y, topLeft.x, topLeft.y, -22, glow);

	drawVineSegment(g, topLeft.x, topLeft.y, topRight.x, topRight.y, -28, glow);
	drawVineSegment(g, bottomLeft.x, bottomLeft.y, bottomRight.x, bottomRight.y, 28, glow);

	drawMysticLeaf(g, topLeft.x, topLeft.y, -Math.PI * 0.72, 1.05, glow);
	drawMysticLeaf(g, topRight.x, topRight.y, -Math.PI * 0.28, 1.05, glow);
	drawMysticLeaf(g, bottomRight.x, bottomRight.y, Math.PI * 0.28, 1.05, glow);
	drawMysticLeaf(g, bottomLeft.x, bottomLeft.y, Math.PI * 0.72, 1.05, glow);
	drawMysticLeaf(g, topPeak.x, topPeak.y, -Math.PI * 0.5, 0.95, glow);
	drawMysticLeaf(g, bottomPeak.x, bottomPeak.y, Math.PI * 0.5, 0.95, glow);

	drawCornerTendril(g, topLeft.x + 8, topLeft.y + 6, -Math.PI * 0.35, glow);
	drawCornerTendril(g, topRight.x - 8, topRight.y + 6, -Math.PI * 0.65, glow);
	drawCornerTendril(g, bottomRight.x - 8, bottomRight.y - 6, Math.PI * 0.65, glow);
	drawCornerTendril(g, bottomLeft.x + 8, bottomLeft.y - 6, Math.PI * 0.35, glow);

	const innerBulge = 6;
	const traceInnerLip = () => {
		g.moveTo(-innerHw, innerTop);
		g.lineTo(innerHw, innerTop);
		g.lineTo(innerHw, innerBottom);
		g.lineTo(-innerHw, innerBottom);
		g.closePath();
	};

	traceInnerLip();
	g.stroke({ color: WOOD.shadow, width: 4, alpha: 0.45 });
	for (const layer of vineAccentLayers(glow, 2.2)) {
		traceInnerLip();
		g.stroke({ color: layer.color, width: layer.width, alpha: layer.alpha });
	}
	if (glow) {
		traceInnerLip();
		g.stroke({ color: THEME.frameGlow, width: 1.2, alpha: 0.35 });
	}

	drawVineSegment(g, -innerHw, innerTop, -innerHw + innerW * 0.18, innerTop, innerBulge, glow);
	drawVineSegment(g, innerHw, innerTop, innerHw - innerW * 0.18, innerTop, -innerBulge, glow);
	drawVineSegment(g, -innerHw, innerBottom, -innerHw + innerW * 0.18, innerBottom, -innerBulge, glow);
	drawVineSegment(g, innerHw, innerBottom, innerHw - innerW * 0.18, innerBottom, innerBulge, glow);
};

export const drawVineReelFrameBorder = (g: Graphics, opts: VineFrameOpts) => {
	const { hw, hh, peakH, frameInset, innerHw, innerHh, innerW, innerH, glow } = opts;

	drawVineHexWreath(
		g,
		{
			topPeak: { x: 0, y: -hh - peakH },
			bottomPeak: { x: 0, y: hh + peakH },
			topLeft: { x: -hw, y: -hh },
			topRight: { x: hw, y: -hh },
			bottomRight: { x: hw, y: hh },
			bottomLeft: { x: -hw, y: hh },
		},
		{
			innerHw,
			innerTop: -innerHh,
			innerBottom: innerHh,
			innerW,
		},
		glow,
	);
};

export type VinePanelBorderOpts = {
	hw: number;
	top: number;
	bottom: number;
	peakH: number;
	frameInset: number;
	glow: boolean;
};

export const drawVinePanelBorder = (g: Graphics, opts: VinePanelBorderOpts) => {
	const { hw, top, bottom, peakH, frameInset, glow } = opts;
	const innerHw = hw - frameInset;
	const innerTop = top + frameInset;
	const innerBottom = bottom - frameInset;
	const innerW = hw * 2 - frameInset * 2;

	drawVineHexWreath(
		g,
		{
			topPeak: { x: 0, y: top - peakH },
			bottomPeak: { x: 0, y: bottom + peakH },
			topLeft: { x: -hw, y: top },
			topRight: { x: hw, y: top },
			bottomRight: { x: hw, y: bottom },
			bottomLeft: { x: -hw, y: bottom },
		},
		{
			innerHw,
			innerTop,
			innerBottom,
			innerW,
		},
		glow,
	);
};

export const fillVinePanelBackground = (
	g: Graphics,
	opts: {
		hw: number;
		top: number;
		bottom: number;
		peakH: number;
		frameInset: number;
		glow: boolean;
		/** Keep translucent fills inside the inner vine lip (win plaques). */
		contained?: boolean;
	},
) => {
	const { hw, top, bottom, peakH, frameInset, glow, contained = false } = opts;
	const innerHw = hw - frameInset;
	const innerTop = top + frameInset;
	const innerW = hw * 2 - frameInset * 2;
	const innerH = bottom - top - frameInset * 2;

	if (glow && !contained) {
		g.moveTo(-hw - 6, top - 6);
		g.lineTo(0, top - peakH - 6);
		g.lineTo(hw + 6, top - 6);
		g.lineTo(hw + 6, bottom + 6);
		g.lineTo(0, bottom + peakH + 6);
		g.lineTo(-hw - 6, bottom + 6);
		g.closePath();
		g.fill({ color: THEME.frameGlow, alpha: 0.25 });
	}

	if (!contained) {
		g.moveTo(-hw, top);
		g.lineTo(0, top - peakH);
		g.lineTo(hw, top);
		g.lineTo(hw, bottom);
		g.lineTo(0, bottom + peakH);
		g.lineTo(-hw, bottom);
		g.closePath();
		g.fill({ color: THEME.bgGlow, alpha: 0.16 });
	}

	g.rect(-innerHw, innerTop, innerW, innerH);
	g.fill({ color: THEME.bgMid, alpha: 0.5 });
	g.rect(-innerHw, innerTop, innerW, innerH);
	g.fill({ color: THEME.bgGlow, alpha: 0.3 });
};