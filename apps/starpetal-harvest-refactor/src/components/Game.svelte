<script lang="ts">
	import { onMount } from 'svelte';

	import { EnablePixiExtension } from 'components-pixi';
	import { EnableHotkey } from 'components-shared';
	import { MainContainer } from 'components-layout';
	import { App, Text, REM } from 'pixi-svelte';
	import { stateModal } from 'state-shared';

	import { UI, UiGameName } from 'components-ui-pixi';
	import { GameVersion } from 'components-ui-html';
	import StarpetalModals from '$starpetal/ui/modals/StarpetalModals.svelte';

	import { getContext } from '../game/context';
	import EnableSound from './EnableSound.svelte';
	import EnableGameActor from './EnableGameActor.svelte';
	import ResumeBet from './ResumeBet.svelte';
	import Sound from './Sound.svelte';
	import StarpetalLoadingScreen from '$starpetal/ui/StarpetalLoadingScreen.svelte';
	import BoardFrame from './BoardFrame.svelte';
	import MultiplierGrid from './MultiplierGrid.svelte';
	import Board from './Board.svelte';
	import Anticipations from './Anticipations.svelte';
	import ClusterWinAmounts from './ClusterWinAmounts.svelte';
	import TumbleBoard from './TumbleBoard.svelte';
	import TumbleWinAmount from './TumbleWinAmount.svelte';
	import FreeSpinCounter from './FreeSpinCounter.svelte';
	import Transition from './Transition.svelte';
	import StarpetalWin from '$starpetal/ui/StarpetalWin.svelte';
	import StarpetalFreeSpinIntro from '$starpetal/ui/StarpetalFreeSpinIntro.svelte';
	import StarpetalFreeSpinOutro from '$starpetal/ui/StarpetalFreeSpinOutro.svelte';
	import StarpetalBackground from '$starpetal/ui/StarpetalBackground.svelte';
	import StarpetalLayer from '$starpetal/ui/StarpetalLayer.svelte';
	import VineBoardFrame from '$starpetal/ui/VineBoardFrame.svelte';
	import StarpetalUI from '$starpetal/ui/StarpetalUI.svelte';
	import SlamStop from '$starpetal/ui/SlamStop.svelte';
	import GoonaIntro from '$starpetal/ui/GoonaIntro.svelte';
	import MultiplierOverlay from '$starpetal/ui/multiplier/MultiplierOverlay.svelte';

	const context = getContext();

	onMount(() => (context.stateLayout.showLoadingScreen = true));

	context.eventEmitter.subscribeOnMount({
		buyBonusConfirm: () => {
			stateModal.modal = { name: 'buyBonusConfirm' };
		},
	});
</script>

<!-- Grove video background — DOM layer behind the transparent Pixi canvas. -->
<StarpetalBackground />

<div class="game-stage">
<App>
	<EnableSound />
	<EnableHotkey />
	<EnableGameActor />
	<EnablePixiExtension />

	{#if context.stateLayout.showLoadingScreen}
		<StarpetalLoadingScreen onloaded={() => (context.stateLayout.showLoadingScreen = false)} />
	{:else}
		<ResumeBet />
		<!--
			The reason why <Sound /> is rendered after clicking the loading screen:
			"Autoplay with sound is allowed if: The user has interacted with the domain (click, tap, etc.)."
			Ref: https://developer.chrome.com/blog/autoplay
		-->
		<Sound />

		<StarpetalLayer />

		<MainContainer>
			<VineBoardFrame />
		</MainContainer>

		<MainContainer>
			<MultiplierGrid />
		</MainContainer>

		<MainContainer>
			<Board />
			<Anticipations />
			<TumbleWinAmount />
		</MainContainer>

		<MainContainer>
			<TumbleBoard />
			<ClusterWinAmounts />
		</MainContainer>

		<MainContainer>
			<MultiplierOverlay />
		</MainContainer>

		<SlamStop />
			<StarpetalUI />
		<StarpetalWin />
		<StarpetalFreeSpinIntro />
		{#if ['desktop', 'landscape'].includes(context.stateLayoutDerived.layoutType())}
			<FreeSpinCounter />
		{/if}
		<StarpetalFreeSpinOutro />
		<Transition />
	{/if}
</App>
</div>

<StarpetalModals>
	{#snippet version()}
		<GameVersion version="0.0.0" />
	{/snippet}
</StarpetalModals>

<!-- Studio intro, plays over everything before the Starpetal loading screen -->
<GoonaIntro />

<style>
	/* Stack the canvas above the grove video (z-index 0). */
	.game-stage {
		position: relative;
		z-index: 1;
	}
</style>
