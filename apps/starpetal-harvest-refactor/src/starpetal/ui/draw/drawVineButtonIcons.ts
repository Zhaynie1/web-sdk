import type { Graphics } from 'pixi.js';

import { THEME } from '../../config/theme';

export type GroveButtonIcon =
	| 'menu'
	| 'paytable'
	| 'volume'
	| 'volumeMuted'
	| 'turbo'
	| 'autospin'
	| 'bonusBuy'
	| 'info'
	| 'exit';

type IconOpts = {
	disabled?: boolean;
	active?: boolean;
};

const iconFill = ({ disabled = false, active = false }: IconOpts) => {
	if (disabled) return 0x5a5a6e;
	if (active) return THEME.vine;
	return THEME.gold;
};

const iconStroke = ({ disabled = false }: IconOpts) =>
	disabled ? 0x2a2a38 : THEME.bgDeep;

const strokeIcon = (
	g: Graphics,
	opts: IconOpts,
	width = 2.5,
	alpha = 0.9,
) => {
	g.stroke({ color: iconStroke(opts), width, alpha, cap: 'round', join: 'round' });
};

const drawMenuIcon = (g: Graphics, s: number, opts: IconOpts) => {
	const w = 22 * s;
	const h = 4.5 * s;
	const gap = 7 * s;
	const r = 2.2 * s;
	const fill = iconFill(opts);

	for (let i = -1; i <= 1; i++) {
		g.roundRect(-w * 0.5, i * gap - h * 0.5, w, h, r);
		g.fill({ color: fill, alpha: opts.disabled ? 0.5 : 1 });
	}
};

const drawPaytableIcon = (g: Graphics, s: number, opts: IconOpts) => {
	const fill = iconFill(opts);
	const pageW = 11 * s;
	const pageH = 18 * s;

	g.roundRect(-pageW - 1.5 * s, -pageH * 0.5, pageW, pageH, 2 * s);
	g.fill({ color: fill, alpha: opts.disabled ? 0.45 : 0.85 });
	g.roundRect(1.5 * s, -pageH * 0.5, pageW, pageH, 2 * s);
	g.fill({ color: fill, alpha: opts.disabled ? 0.45 : 1 });

	g.moveTo(-pageW - 1.5 * s, -pageH * 0.5);
	g.lineTo(0, -pageH * 0.5 - 4 * s);
	g.lineTo(pageW + 1.5 * s, -pageH * 0.5);
	strokeIcon(g, opts, 2 * s);

	for (let row = 0; row < 3; row++) {
		const y = -5 * s + row * 5.5 * s;
		g.moveTo(-7 * s, y);
		g.lineTo(7 * s, y);
		g.stroke({ color: THEME.bgDeep, width: 1.6 * s, alpha: opts.disabled ? 0.25 : 0.55 });
	}
};

const drawVolumeIcon = (g: Graphics, s: number, opts: IconOpts, muted = false) => {
	const fill = iconFill(opts);

	g.roundRect(-14 * s, -7 * s, 9 * s, 14 * s, 1.5 * s);
	g.fill({ color: fill, alpha: opts.disabled ? 0.5 : 1 });

	g.moveTo(-5 * s, -7 * s);
	g.lineTo(4 * s, -13 * s);
	g.lineTo(4 * s, 13 * s);
	g.lineTo(-5 * s, 7 * s);
	g.closePath();
	g.fill({ color: fill, alpha: opts.disabled ? 0.5 : 1 });
	strokeIcon(g, opts, 2 * s, 0.75);

	if (!muted) {
		const arcs = [6 * s, 10 * s, 14 * s];
		for (const r of arcs) {
			g.arc(5 * s, 0, r, -Math.PI * 0.38, Math.PI * 0.38);
			g.stroke({
				color: opts.active ? THEME.dew : fill,
				width: 2.2 * s,
				alpha: opts.disabled ? 0.3 : 0.9,
				cap: 'round',
			});
		}
	} else {
		g.moveTo(8 * s, -10 * s);
		g.lineTo(18 * s, 10 * s);
		g.stroke({ color: THEME.petal, width: 2.8 * s, alpha: 0.9, cap: 'round' });
	}
};

const drawTurboIcon = (g: Graphics, s: number, opts: IconOpts) => {
	const fill = iconFill(opts);

	g.moveTo(2 * s, -16 * s);
	g.lineTo(-8 * s, 2 * s);
	g.lineTo(-1 * s, 2 * s);
	g.lineTo(-4 * s, 16 * s);
	g.lineTo(10 * s, -4 * s);
	g.lineTo(2 * s, -4 * s);
	g.closePath();
	g.fill({ color: fill, alpha: opts.disabled ? 0.45 : 1 });
	strokeIcon(g, opts, 2.2 * s);

	if (opts.active && !opts.disabled) {
		g.moveTo(2 * s, -16 * s);
		g.lineTo(-8 * s, 2 * s);
		g.lineTo(-1 * s, 2 * s);
		g.lineTo(-4 * s, 16 * s);
		g.lineTo(10 * s, -4 * s);
		g.lineTo(2 * s, -4 * s);
		g.closePath();
		g.stroke({ color: THEME.dew, width: 1.2 * s, alpha: 0.55 });
	}
};

const drawAutospinIcon = (g: Graphics, s: number, opts: IconOpts) => {
	const fill = iconFill(opts);
	const r = 13 * s;

	g.arc(0, 0, r, Math.PI * 0.15, Math.PI * 1.65);
	g.stroke({ color: fill, width: 3 * s, alpha: opts.disabled ? 0.4 : 1, cap: 'round' });

	const tipAngle = Math.PI * 1.65;
	const tipX = Math.cos(tipAngle) * r;
	const tipY = Math.sin(tipAngle) * r;
	g.moveTo(tipX, tipY);
	g.lineTo(tipX - 8 * s, tipY - 2 * s);
	g.lineTo(tipX - 2 * s, tipY - 8 * s);
	g.closePath();
	g.fill({ color: fill, alpha: opts.disabled ? 0.4 : 1 });

	g.circle(0, 0, 4 * s);
	g.fill({ color: opts.active ? THEME.dew : THEME.starlight, alpha: opts.disabled ? 0.35 : 0.9 });
};

const drawBonusBuyIcon = (g: Graphics, s: number, opts: IconOpts) => {
	const fill = iconFill(opts);
	const petals = 5;
	const outerR = 14 * s;
	const innerR = 6 * s;

	for (let i = 0; i < petals; i++) {
		const angle = (i / petals) * Math.PI * 2 - Math.PI * 0.5;
		const cx = Math.cos(angle) * outerR * 0.55;
		const cy = Math.sin(angle) * outerR * 0.55;
		g.circle(cx, cy, outerR * 0.42);
		g.fill({ color: opts.active ? THEME.petal : fill, alpha: opts.disabled ? 0.4 : 0.88 });
	}

	g.circle(0, 0, innerR);
	g.fill({ color: THEME.starlight, alpha: opts.disabled ? 0.35 : 0.95 });
	g.circle(0, 0, innerR * 0.45);
	g.fill({ color: fill, alpha: opts.disabled ? 0.4 : 1 });
};

const drawInfoIcon = (g: Graphics, s: number, opts: IconOpts) => {
	const fill = iconFill(opts);

	g.circle(0, 0, 15 * s);
	g.stroke({ color: fill, width: 3 * s, alpha: opts.disabled ? 0.4 : 1 });

	g.circle(0, -6 * s, 2.5 * s);
	g.fill({ color: fill, alpha: opts.disabled ? 0.4 : 1 });

	g.roundRect(-2 * s, -1 * s, 4 * s, 11 * s, 2 * s);
	g.fill({ color: fill, alpha: opts.disabled ? 0.4 : 1 });
};

const drawExitIcon = (g: Graphics, s: number, opts: IconOpts) => {
	const fill = iconFill(opts);
	const d = 10 * s;

	g.moveTo(-d, -d);
	g.lineTo(d, d);
	g.moveTo(d, -d);
	g.lineTo(-d, d);
	g.stroke({ color: fill, width: 3.5 * s, alpha: opts.disabled ? 0.4 : 1, cap: 'round' });
};

/** Grove-themed vector icon — drawn inside vine circle buttons. */
export const drawGroveButtonIcon = (
	g: Graphics,
	icon: GroveButtonIcon,
	radius: number,
	opts: IconOpts = {},
) => {
	g.clear();
	const s = radius / 44;

	switch (icon) {
		case 'menu':
			drawMenuIcon(g, s, opts);
			break;
		case 'paytable':
			drawPaytableIcon(g, s, opts);
			break;
		case 'volume':
			drawVolumeIcon(g, s, opts, false);
			break;
		case 'volumeMuted':
			drawVolumeIcon(g, s, opts, true);
			break;
		case 'turbo':
			drawTurboIcon(g, s, opts);
			break;
		case 'autospin':
			drawAutospinIcon(g, s, opts);
			break;
		case 'bonusBuy':
			drawBonusBuyIcon(g, s, opts);
			break;
		case 'info':
			drawInfoIcon(g, s, opts);
			break;
		case 'exit':
			drawExitIcon(g, s, opts);
			break;
	}
};