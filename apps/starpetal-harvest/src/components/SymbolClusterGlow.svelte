<script lang="ts">
	import { Graphics } from 'pixi-svelte';

	import { SYMBOL_SIZE } from '../game/constants';
	import { THEME } from '../game/theme';

	type Props = {
		x?: number;
		y?: number;
		variant: 'preWin' | 'win';
	};

	const props: Props = $props();

	const size = SYMBOL_SIZE * 0.94;
	const half = size / 2;

	const SPARKLES = [
		{ x: -0.52, y: -0.48, r: 1.6, a: 0.9 },
		{ x: 0.38, y: -0.42, r: 1.2, a: 0.7 },
		{ x: -0.28, y: 0.36, r: 1.3, a: 0.8 },
		{ x: 0.5, y: 0.28, r: 1.0, a: 0.6 },
		{ x: -0.08, y: -0.58, r: 0.9, a: 0.55 },
		{ x: 0.12, y: 0.52, r: 1.4, a: 0.75 },
	] as const;
</script>

<Graphics
	x={props.x}
	y={props.y}
	draw={(g) => {
		g.clear();
		const isPreWin = props.variant === 'preWin';
		const fillAlpha = isPreWin ? 0.18 : 0.22;
		const strokeAlpha = isPreWin ? 0.55 : 0.78;
		const sparkleScale = isPreWin ? 0.92 : 1;

		g.roundRect(-half, -half, size, size, 14);
		g.fill({ color: THEME.aurora, alpha: fillAlpha });
		g.roundRect(-half, -half, size, size, 14);
		g.stroke({ color: THEME.petal, width: 2.5, alpha: strokeAlpha });
		g.roundRect(-half + 3, -half + 3, size - 6, size - 6, 12);
		g.stroke({ color: THEME.gold, width: 1.5, alpha: strokeAlpha * 0.55 });

		for (const sparkle of SPARKLES) {
			const sx = sparkle.x * half;
			const sy = sparkle.y * half;
			g.circle(sx, sy, sparkle.r);
			g.fill({ color: THEME.starlight, alpha: sparkle.a * sparkleScale });
			g.circle(sx, sy, sparkle.r * 0.45);
			g.fill({ color: THEME.dew, alpha: sparkle.a * 0.45 * sparkleScale });
		}
	}}
/>