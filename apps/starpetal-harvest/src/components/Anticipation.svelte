<script lang="ts">
	import { onMount } from 'svelte';
	import { Graphics } from 'pixi-svelte';

	import { getAnticipationLayout } from '../game/anticipationLayout';
	import { THEME } from '../game/theme';
	import type { Reel } from '../game/stateGame.svelte';

	type Props = {
		reel: Reel;
		active: boolean;
		retained: boolean;
	};

	const props: Props = $props();
	const layout = $derived(getAnticipationLayout(props.reel.reelIndex));
	let pulse = $state(0.65);
	let frame = $state(0);

	onMount(() => {
		let raf = 0;
		const tick = () => {
			frame += 1;
			const speed = props.active ? 0.09 : 0.05;
			const depth = props.active ? 0.28 : 0.14;
			pulse = 0.5 + Math.sin(frame * speed) * depth;
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	const drawTrail = (g: import('pixi.js').Graphics) => {
		g.clear();

		const w = layout.width;
		const h = layout.height;
		const halfW = w * 0.5;
		const intensity = props.active ? 1 : 0.72;
		const alpha = pulse * intensity;
		const inset = 2;

		g.roundRect(-halfW + inset, inset, w - inset * 2, h - inset * 2, 4);
		g.fill({ color: THEME.aurora, alpha: alpha * 0.12 });

		g.roundRect(-halfW + inset * 2, inset * 2, w - inset * 4, h - inset * 4, 3);
		g.fill({ color: THEME.frameGlow, alpha: alpha * 0.22 });

		g.roundRect(-halfW * 0.34, inset * 3, w * 0.34, h - inset * 6, 2);
		g.fill({ color: THEME.starlight, alpha: alpha * 0.38 });

		const streakCount = props.active ? 6 : 4;
		for (let i = 0; i < streakCount; i++) {
			const streakY = ((frame * (props.active ? 2.2 : 1.4) + i * (h / streakCount)) % (h + 32)) - 16;
			g.roundRect(-halfW * 0.16, streakY, w * 0.16, h * 0.075, 3);
			g.fill({ color: THEME.gold, alpha: alpha * 0.45 });
		}

		g.roundRect(-halfW + inset, 0, w - inset * 2, 5, 2);
		g.fill({ color: THEME.petal, alpha: alpha * 0.6 });
		g.roundRect(-halfW + inset, h - 5, w - inset * 2, 5, 2);
		g.fill({ color: THEME.petal, alpha: alpha * 0.6 });
	};
</script>

<Graphics x={layout.x} y={layout.y} draw={drawTrail} />