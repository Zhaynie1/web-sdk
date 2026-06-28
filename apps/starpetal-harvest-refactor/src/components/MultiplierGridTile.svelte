<script lang="ts">
	import { Container, Graphics } from 'pixi-svelte';
	import { onMount } from 'svelte';
	import { backOut, cubicOut } from 'svelte/easing';

	import SilverText from '$starpetal/ui/SilverText.svelte';
	import { createRafTween } from '$starpetal/game/state.svelte';
	import { SYMBOL_SIZE } from '../game/constants';

	// One underlying-multiplier tile, rendered overlaid on its board cell. Drawn
	// procedurally as a premium gem-glass plaque (faux vertical gradient, beveled
	// starlight rim, top gloss, drop shadow) instead of the old flat lavender rect.
	type Props = { col: number; row: number; multiplier: number };
	const props: Props = $props();

	const S = SYMBOL_SIZE * 0.96; // match the white cluster-select frame

	// Bloom in on appear, pulse on grow — reinforces "a multiplier blooms where the
	// symbol hit". The rAF tweens self-stop when settled, so idle tiles cost nothing.
	const scale = createRafTween(0.55);
	const flash = createRafTween(0);

	const pop = () => {
		flash.set(0.9, { duration: 90, easing: cubicOut });
		scale.set(1.16, { duration: 150, easing: backOut });
		flash.set(0, { duration: 340, easing: cubicOut });
		scale.set(1, { duration: 210, easing: backOut });
	};

	onMount(pop);

	let prev = props.multiplier;
	$effect(() => {
		if (props.multiplier !== prev) {
			prev = props.multiplier;
			pop();
		}
	});

	const drawTile = (g: import('pixi.js').Graphics) => {
		g.clear();
		const h = S / 2;
		// drop shadow lifts the tile off the reels
		g.roundRect(-h + 2, -h + 5, S, S, 16);
		g.fill({ color: 0x150a2e, alpha: 0.38 });
		// deep violet base
		g.roundRect(-h, -h, S, S, 16);
		g.fill({ color: 0x3a2173 });
		// stacked lighter bands toward the top → faux vertical gradient
		g.roundRect(-h, -h, S, S * 0.66, 16);
		g.fill({ color: 0x6a3ec6, alpha: 0.92 });
		g.roundRect(-h, -h, S, S * 0.42, 16);
		g.fill({ color: 0x9163e8, alpha: 0.85 });
		// glass gloss across the top
		g.roundRect(-h + 6, -h + 5, S - 12, S * 0.24, 10);
		g.fill({ color: 0xffffff, alpha: 0.22 });
		// soft inner sheen
		g.ellipse(0, -h * 0.42, S * 0.34, S * 0.2);
		g.fill({ color: 0xece0ff, alpha: 0.16 });
		// bevel: bright starlight rim + inner shadow line
		g.roundRect(-h, -h, S, S, 16);
		g.stroke({ color: 0xe4d7ff, width: 2.5, alpha: 0.95 });
		g.roundRect(-h + 3, -h + 3, S - 6, S - 6, 13);
		g.stroke({ color: 0x241050, width: 1.5, alpha: 0.45 });
		// corner starlight sparkles
		const sparkles = [
			{ x: -0.33, y: -0.33, r: 1.5, a: 0.9 },
			{ x: 0.3, y: -0.28, r: 1.1, a: 0.65 },
			{ x: 0.34, y: 0.32, r: 1.3, a: 0.7 },
		];
		for (const s of sparkles) {
			g.circle(s.x * S, s.y * S, s.r);
			g.fill({ color: 0xffffff, alpha: s.a });
		}
	};

	const drawFlash = (g: import('pixi.js').Graphics) => {
		g.clear();
		const s = SYMBOL_SIZE * 1.2;
		g.roundRect(-s / 2, -s / 2, s, s, 22);
		g.fill({ color: 0xcdb4ff, alpha: 0.6 });
	};
</script>

<Container
	x={(props.col + 0.5) * SYMBOL_SIZE}
	y={(props.row + 0.5) * SYMBOL_SIZE}
	scale={scale.current}
>
	<Graphics alpha={flash.current} draw={drawFlash} />
	<Graphics draw={drawTile} />
	{#if props.multiplier > 1}
		<SilverText
			anchor={0.5}
			maxWidth={SYMBOL_SIZE * 0.52}
			targetFontSize={SYMBOL_SIZE * 0.55}
			text={`${props.multiplier}X`}
		/>
	{/if}
</Container>
