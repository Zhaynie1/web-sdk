<script lang="ts">
	import { onMount } from 'svelte';

	import { EnablePixiExtension } from 'components-pixi';
	import { EnableHotkey } from 'components-shared';
	import { MainContainer } from 'components-layout';
	import { App } from 'pixi-svelte';
	import { stateModal } from 'state-shared';

	import StarpetalUI from './ui/StarpetalUI.svelte';
	import { GameVersion } from 'components-ui-html';
	import StarpetalModals from './StarpetalModals.svelte';

	import { getContext } from '../game/context';
	import EnableSound from './EnableSound.svelte';
	import EnableGameActor from './EnableGameActor.svelte';
	import EnableLocalPlay from './EnableLocalPlay.svelte';
	import ResumeBet from './ResumeBet.svelte';
	import Sound from './Sound.svelte';
	import GroveVideoBackground from './GroveVideoBackground.svelte';
	import IntroVideo from './IntroVideo.svelte';
	import LoadingScreen from './LoadingScreen.svelte';
	import BoardFrame from './BoardFrame.svelte';
	import Board from './Board.svelte';
	import ClusterWinAmounts from './ClusterWinAmounts.svelte';
	import MultiplierGrid from './MultiplierGrid.svelte';
	import MultiplierBoard from './MultiplierBoard.svelte';
	import MultiplierTotal from './MultiplierTotal.svelte';
	import TumbleWinAmount from './TumbleWinAmount.svelte';

	import TumbleBoard from './TumbleBoard.svelte';

	import Win from './Win.svelte';
	import FreeSpinIntro from './FreeSpinIntro.svelte';
	import FreeSpinCounter from './FreeSpinCounter.svelte';
	import FreeSpinOutro from './FreeSpinOutro.svelte';
	import Transition from './Transition.svelte';
	const context = getContext();
	let showIntroVideo = $state(true);

	onMount(() => {
		context.stateLayout.showLoadingScreen = true;
	});

	context.eventEmitter.subscribeOnMount({
		buyBonusConfirm: () => {
			stateModal.modal = { name: 'buyBonusConfirm' };
		},
	});
</script>

{#if showIntroVideo}
	<IntroVideo oncomplete={() => (showIntroVideo = false)} />
{/if}

{#if !showIntroVideo}
	<GroveVideoBackground />
{/if}

<div class="game-stage">
<App>
	<EnableSound />
	<EnableHotkey />
	<EnableGameActor />
	<EnableLocalPlay />
	<EnablePixiExtension />

	{#if !showIntroVideo}
		{#if context.stateLayout.showLoadingScreen}
			<LoadingScreen onloaded={() => (context.stateLayout.showLoadingScreen = false)} />
		{:else}
		<ResumeBet />
		<Sound />

		<MainContainer>
			<BoardFrame />
		</MainContainer>

		<MainContainer>
			<MultiplierGrid />
			<Board />
		</MainContainer>

		<MainContainer>
			<TumbleBoard />
			<ClusterWinAmounts />
		</MainContainer>

		<MainContainer>
			<TumbleWinAmount />
			<MultiplierBoard />
			<MultiplierTotal />
		</MainContainer>

		<StarpetalUI />
		<Win />
		<FreeSpinIntro />
		<FreeSpinCounter />
		<FreeSpinOutro />
		<Transition />
		{/if}
	{/if}
</App>
</div>

{#if !showIntroVideo && context.stateLayout.showLoadingScreen && context.stateApp.loaded}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="press-overlay"
		onclick={() => (context.stateLayout.showLoadingScreen = false)}
		role="presentation"
	></div>
{/if}

<StarpetalModals>
	{#snippet version()}
		<GameVersion version="0.0.0" />
	{/snippet}
</StarpetalModals>

<style>
	.game-stage {
		position: relative;
		z-index: 1;
	}

	.press-overlay {
		position: fixed;
		inset: 0;
		z-index: 100005;
		cursor: pointer;
	}
</style>