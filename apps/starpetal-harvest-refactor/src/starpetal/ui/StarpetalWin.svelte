<script lang="ts">
	import { Container } from 'pixi-svelte';
	import { FadeContainer, WinCountUpProvider } from 'components-pixi';
	import { waitForResolve, waitForTimeout } from 'utils-shared/wait';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { CanvasSizeRectangle, MainContainer } from 'components-layout';
	import { OnMount } from 'components-shared';

	import { getContext } from '$game/context';
	import type { WinLevelData } from '$game/winLevelMap';
	import WinCoins from '$components/WinCoins.svelte';
	import PressToContinue from '$components/PressToContinue.svelte';
	import SilverText from './SilverText.svelte';
	import WinFrameDisplay from './panels/WinFrameDisplay.svelte';
	import { getWinFrameMetrics } from './panels/winFrameLayout';

	// Starpetal win celebration: same engine count-up / press flow as the cluster
	// Win, but the gold-font amount + spine become a vine plaque + silver text.
	const context = getContext();

	let show = $state(false);
	let amount = $state(0);
	let winLevelData = $state<WinLevelData>();
	let oncomplete = $state(() => {});
	let onCountUpComplete = $state(() => {});

	context.eventEmitter.subscribeOnMount({
		winShow: () => (show = true),
		winHide: () => (show = false),
		winUpdate: async (emitterEvent) => {
			amount = emitterEvent.amount;
			winLevelData = emitterEvent.winLevelData;
			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});
</script>

<FadeContainer {show} sortableChildren>
	{#if winLevelData}
		{@const isBigWin = winLevelData.type === 'big'}
		{@const duration = winLevelData.presentDuration}
		{@const board = context.stateGameDerived.boardLayout()}
		{@const frameWidth = board.width * 0.7}
		{@const frameMetrics = getWinFrameMetrics(frameWidth)}
		<WinCountUpProvider {amount} {duration} oncomplete={() => onCountUpComplete()}>
			{#snippet children({ countUpAmount, startCountUp, finishCountUp, countUpCompleted })}
				{#if isBigWin}
					<CanvasSizeRectangle eventMode="none" backgroundColor={0x000000} backgroundAlpha={0.5} />
				{/if}

				<OnMount
					onmount={async () => {
						// Cap the count-up so a stuck animation can't freeze the win screen.
						await Promise.race([startCountUp(), waitForTimeout((duration ?? 1000) + 1500)]);
						await waitForTimeout(300);
						oncomplete();
					}}
				/>

				<MainContainer>
					<Container eventMode="none" x={board.x} y={board.y}>
						<WinFrameDisplay title={winLevelData.text} {frameWidth} glow={isBigWin}>
							<SilverText
								anchor={0.5}
								maxWidth={frameMetrics.amountMaxWidth}
								targetFontSize={frameMetrics.amountFontSize}
								text={bookEventAmountToCurrencyString(countUpAmount)}
							/>
						</WinFrameDisplay>
					</Container>
				</MainContainer>

				<WinCoins emit={!countUpCompleted} levelAlias={winLevelData?.alias} />

				<Container zIndex={50}>
					<PressToContinue onpress={() => (countUpCompleted ? oncomplete() : finishCountUp())} />
				</Container>
			{/snippet}
		</WinCountUpProvider>
	{/if}
</FadeContainer>
