<script lang="ts">
	import { onMount } from 'svelte';
	import { Graphics } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import { THEME } from '$starpetal/config/theme';
	import type { Reel } from '../game/stateGame.svelte';
	import { SYMBOL_SIZE } from '../game/constants';
	import { getSymbolX } from '../game/utils';

	// Scatter-anticipation reel trail: a procedural shimmer sized to the exact reel
	// column (full board height × one symbol wide) in the starpetal aurora/gold/petal
	// palette — replaces the mis-sized anticipation spine so it fits the reels.
	type Props = {
		reel: Reel;
		oncomplete: () => void;
	};

	const props: Props = $props();
	const context = getContext();

	const board = $derived(context.stateGameDerived.boardLayout());
	// Column geometry in the same board-local space the engine lays symbols out in.
	const columnCenterX = $derived(board.x - board.width * 0.5 + getSymbolX(props.reel.reelIndex));
	const columnTopY = $derived(board.y - board.height * 0.5);
	const W = SYMBOL_SIZE;
	const H = $derived(board.height);

	let pulse = $state(0.65);
	let frame = $state(0);
	let cleared = $state(false);

	onMount(() => {
		let raf = 0;
		const tick = () => {
			frame += 1;
			pulse = 0.5 + Math.sin(frame * 0.09) * 0.28;
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	// The cascading engine never clears `anticipating` in the normal flow, so the
	// trail must switch itself off the moment this reel finishes baiting. That moment
	// is when the engine hands anticipation to the next reel (it sets the next reel's
	// `anticipating` as this reel's symbols land) — or, for the final anticipated reel
	// / a slam stop, when this reel itself stops. Without this, the trail lingers on
	// the reel behind through the landing bounce.
	const nextReelAnticipating = $derived(
		context.stateGame.board[props.reel.reelIndex + 1]?.reelState.anticipating ?? false,
	);
	const finishedBaiting = $derived(
		nextReelAnticipating || props.reel.reelState.motion === 'stopped',
	);

	$effect(() => {
		if (finishedBaiting && !cleared) {
			cleared = true;
			props.oncomplete();
		}
	});

	const drawTrail = (g: import('pixi.js').Graphics) => {
		g.clear();

		const w = W;
		const h = H;
		const halfW = w * 0.5;
		const a = pulse;
		const inset = 2;

		g.roundRect(-halfW + inset, inset, w - inset * 2, h - inset * 2, 4);
		g.fill({ color: THEME.aurora, alpha: a * 0.12 });

		g.roundRect(-halfW + inset * 2, inset * 2, w - inset * 4, h - inset * 4, 3);
		g.fill({ color: THEME.frameGlow, alpha: a * 0.22 });

		g.roundRect(-halfW * 0.34, inset * 3, w * 0.34, h - inset * 6, 2);
		g.fill({ color: THEME.starlight, alpha: a * 0.38 });

		const streakCount = 6;
		for (let i = 0; i < streakCount; i++) {
			const streakY = ((frame * 2.2 + i * (h / streakCount)) % (h + 32)) - 16;
			g.roundRect(-halfW * 0.16, streakY, w * 0.16, h * 0.075, 3);
			g.fill({ color: THEME.gold, alpha: a * 0.45 });
		}

		g.roundRect(-halfW + inset, 0, w - inset * 2, 5, 2);
		g.fill({ color: THEME.petal, alpha: a * 0.6 });
		g.roundRect(-halfW + inset, h - 5, w - inset * 2, 5, 2);
		g.fill({ color: THEME.petal, alpha: a * 0.6 });
	};
</script>

{#if !finishedBaiting}
	<Graphics zIndex={-1} x={columnCenterX} y={columnTopY} draw={drawTrail} />
{/if}
