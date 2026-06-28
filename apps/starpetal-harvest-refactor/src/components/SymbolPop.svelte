<script lang="ts">
	import { onMount } from 'svelte';
	import { Tween } from 'svelte/motion';
	import { backOut } from 'svelte/easing';
	import { Container, Sprite, Graphics } from 'pixi-svelte';
	import { stateBetDerived } from 'state-shared';

	import { getSymbolInfo } from '../game/utils';
	import { SYMBOL_SIZE } from '../game/constants';
	import { THEME } from '$starpetal/config/theme';

	// Generic cluster "pop" — a little bubble bursting: the symbol swells, then pops
	// (vanishes) as a ring + droplets burst outward. Signals completion when done.
	// Scale/alpha go on Containers (a pixi Sprite derives scale from width/height,
	// so animating the Sprite's scale directly gets clobbered).
	type Props = {
		x?: number;
		y?: number;
		symbolInfo: ReturnType<typeof getSymbolInfo>;
		oncomplete?: () => void;
	};

	const props: Props = $props();
	const symbolScale = new Tween(1);
	const symbolAlpha = new Tween(1);
	const burst = new Tween(0); // 0 = intact, 1 = fully burst

	onMount(async () => {
		const d = 240 / stateBetDerived.timeScale();
		// swell
		await symbolScale.set(1.2, { duration: d * 0.4, easing: backOut });
		// pop: symbol snaps away while the burst ring + droplets fly out
		void symbolAlpha.set(0, { duration: d * 0.22 });
		void symbolScale.set(1.55, { duration: d * 0.6 });
		await burst.set(1, { duration: d * 0.6 });
		props.oncomplete?.();
	});

	const DROPS = 7;
	const drawBurst = (g: import('pixi.js').Graphics) => {
		g.clear();
		const t = burst.current;
		if (t <= 0 || t >= 1) return;

		const fade = 1 - t;
		const base = SYMBOL_SIZE * 0.42;

		// expanding white burst ring
		const ringR = base * (0.55 + t * 1.25);
		g.circle(0, 0, ringR);
		g.stroke({ color: 0xffffff, width: SYMBOL_SIZE * 0.06 * fade, alpha: fade * 0.95 });
		// inner tinted ring
		g.circle(0, 0, ringR * 0.78);
		g.stroke({ color: THEME.dew, width: SYMBOL_SIZE * 0.035 * fade, alpha: fade * 0.5 });

		// droplets flying outward
		const dist = base * (0.3 + t * 1.4);
		for (let i = 0; i < DROPS; i++) {
			const angle = (i / DROPS) * Math.PI * 2 + 0.4;
			g.circle(Math.cos(angle) * dist, Math.sin(angle) * dist, SYMBOL_SIZE * 0.07 * fade);
			g.fill({ color: i % 2 === 0 ? 0xffffff : THEME.petal, alpha: fade * 0.9 });
		}
	};
</script>

<Container x={props.x} y={props.y}>
	<Container scale={symbolScale.current} alpha={symbolAlpha.current}>
		<Sprite
			anchor={0.5}
			key={props.symbolInfo.assetKey}
			width={SYMBOL_SIZE * props.symbolInfo.sizeRatios.width}
			height={SYMBOL_SIZE * props.symbolInfo.sizeRatios.height}
		/>
	</Container>
	<Graphics draw={drawBurst} />
</Container>
