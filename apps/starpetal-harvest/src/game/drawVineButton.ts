import type { Graphics } from 'pixi.js';

import { THEME } from './theme';

const WOOD = {
	shadow: 0x2a1508,
	bark: 0x4a2c18,
	mid: 0x6b4428,
	highlight: 0xc9a45c,
	moss: 0x3d5c34,
} as const;

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

export type VineButtonDrawOpts = {
	disabled?: boolean;
	hovered?: boolean;
	glow?: boolean;
};

const drawVineArcSegment = (
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

	const layers: { color: number; width: number; alpha: number; offset: number }[] = [
		{ color: WOOD.shadow, width: 10, alpha: 0.82, offset: 0 },
		{ color: WOOD.bark, width: 7, alpha: 0.96, offset: 0.6 },
		{ color: WOOD.mid, width: 5, alpha: 0.92, offset: 1.2 },
		{ color: WOOD.highlight, width: 2.2, alpha: 0.7, offset: 2 },
		...vineAccentLayers(glow, 2.4).map((layer, index) => ({ ...layer, offset: 2.4 + index * 0.22 })),
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

const drawCircleWreath = (g: Graphics, radius: number, glow: boolean) => {
	const segments = 10;
	const bulge = radius * 0.14;

	for (let i = 0; i < segments; i++) {
		const a1 = (i / segments) * Math.PI * 2 - Math.PI * 0.5;
		const a2 = ((i + 1) / segments) * Math.PI * 2 - Math.PI * 0.5;
		drawVineArcSegment(
			g,
			Math.cos(a1) * radius,
			Math.sin(a1) * radius,
			Math.cos(a2) * radius,
			Math.sin(a2) * radius,
			i % 2 === 0 ? bulge : -bulge,
			glow,
		);
	}

	for (let i = 0; i < 6; i++) {
		const angle = (i / 6) * Math.PI * 2 - Math.PI * 0.5;
		drawMysticLeaf(
			g,
			Math.cos(angle) * radius,
			Math.sin(angle) * radius,
			angle + Math.PI * 0.5,
			0.72,
			glow,
		);
	}
};

/** Circular grove control — dark fill + wood vine wreath (matches slot / bar frames). */
export const drawVineCircleButton = (
	g: Graphics,
	radius: number,
	{ disabled = false, hovered = false, glow = false }: VineButtonDrawOpts = {},
) => {
	const r = radius;
	const dim = disabled ? 0.45 : 1;
	const hoverBoost = hovered && !disabled ? 1.08 : 1;
	const frameGlow = glow || hovered;

	g.clear();

	g.circle(0, 0, r + 3);
	g.fill({ color: WOOD.shadow, alpha: 0.85 * dim });

	g.circle(0, 0, r);
	g.fill({ color: THEME.bgMid, alpha: (disabled ? 0.42 : 0.88) * hoverBoost });
	g.circle(0, 0, r);
	g.fill({ color: THEME.bgGlow, alpha: (disabled ? 0.12 : 0.32) * hoverBoost });

	if (glow && !disabled) {
		g.circle(0, 0, r + 5);
		g.stroke({ color: THEME.frameGlow, width: 4, alpha: 0.32 });
	}

	drawCircleWreath(g, r - 2, frameGlow && !disabled);

	const innerR = r - 8;
	g.circle(0, 0, innerR);
	g.stroke({ color: WOOD.bark, width: 1.5, alpha: 0.4 * dim });
	for (const layer of vineAccentLayers(frameGlow && !disabled, 1.4)) {
		g.circle(0, 0, innerR);
		g.stroke({ color: layer.color, width: layer.width, alpha: layer.alpha * dim * 0.65 });
	}

	g.arc(0, 0, r - 4, -Math.PI * 0.82, -Math.PI * 0.18);
	g.stroke({ color: THEME.gold, width: 2, alpha: (disabled ? 0.12 : 0.32) * hoverBoost });
};

