<script lang="ts">
	import { CanvasSizeRectangle } from 'components-layout';
	import { stateBet, stateBetDerived } from 'state-shared';

	import { getContext } from '$game/context';
	import { isLocalPlayRoute } from '../localPlay/localDemo';
	import { demoState } from '../localPlay/demoState.svelte';

	// Tap-to-turbo: while the reels are dropping, a click anywhere on the play area
	// fast-forwards the rest of THIS spin — the remaining reels skip their fall-in
	// delays and tumbles/win play at turbo speed — then the player's turbo setting is
	// restored when the round ends.
	//
	// We deliberately do NOT use Board.stop() (the hard slam): in the offline demo it
	// can leave a spin/animation promise unresolved, hanging the round and graying out
	// the spin button. A one-shot turbo achieves the same "speed it up" intent safely.
	const context = getContext();

	const roundBusy = $derived.by(() => {
		void demoState.busy;
		void context.stateXstate.value;
		return isLocalPlayRoute() ? demoState.busy : !context.stateXstateDerived.isIdle();
	});

	const reelsSpinning = $derived(
		context.stateGame.board.some((reel) => reel.reelState.motion !== 'stopped'),
	);

	let boosted = $state(false);

	const slam = () => {
		// Already turbo (boosted this spin, or the player's setting is on): nothing to do.
		if (boosted || stateBet.isTurbo) return;
		boosted = true;
		stateBetDerived.updateIsTurbo(true, { persistent: false });
	};

	// Restore turbo as soon as THIS spin's reels finish dropping — not at round end.
	// A bought bonus is one long round, so resetting at round end would keep the whole
	// bonus in turbo; per-drop reset means one tap speeds only the current spin's drop,
	// and the win/tumble animations that follow run at a stable (un-turbo'd) timeScale.
	$effect(() => {
		if (!reelsSpinning && boosted) {
			stateBetDerived.updateIsTurbo(false, { persistent: false });
			boosted = false;
		}
	});
</script>

{#if roundBusy && reelsSpinning}
	<CanvasSizeRectangle
		eventMode="static"
		cursor="pointer"
		backgroundColor={0x000000}
		backgroundAlpha={0.001}
		onpointerdown={slam}
	/>
{/if}
