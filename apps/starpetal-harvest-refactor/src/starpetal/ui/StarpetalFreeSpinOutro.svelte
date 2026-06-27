<script lang="ts">
	import { Container } from 'pixi-svelte';
	import { FadeContainer, WinCountUpProvider, ResponsiveBitmapText } from 'components-pixi';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { waitForResolve } from 'utils-shared/wait';
	import { CanvasSizeRectangle, MainContainer } from 'components-layout';
	import { OnMount } from 'components-shared';

	import { getContext } from '$game/context';
	import type { WinLevelData } from '$game/winLevelMap';
	import PressToContinue from '$components/PressToContinue.svelte';
	import WinCoins from '$components/WinCoins.svelte';
	import WinFrameDisplay from './panels/WinFrameDisplay.svelte';
	import { getWinFrameMetrics } from './panels/winFrameLayout';

	// Starpetal free-spin outro: vine "TOTAL WIN" plaque + silver count-up,
	// replacing the cluster's localised sprites + gold spine.
	const context = getContext();

	let show = $state(false);
	let amount = $state(0);
	let winLevelData = $state<WinLevelData>();
	let oncomplete = $state(() => {});
	let onCountUpComplete = $state(() => {});

	context.eventEmitter.subscribeOnMount({
		freeSpinOutroShow: () => (show = true),
		freeSpinOutroHide: () => (show = false),
		freeSpinOutroCountUp: async (emitterEvent) => {
			amount = emitterEvent.amount;
			winLevelData = emitterEvent.winLevelData;
			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});
</script>

<FadeContainer {show} duration={200} zIndex={30} sortableChildren>
	{#if winLevelData}
		{@const duration = winLevelData.presentDuration}
		{@const isBigWin = winLevelData.type === 'big'}
		{@const board = context.stateGameDerived.boardLayout()}
		{@const frameWidth = board.width * 0.7}
		{@const frameMetrics = getWinFrameMetrics(frameWidth)}
		<WinCountUpProvider {amount} {duration} oncomplete={() => onCountUpComplete()}>
			{#snippet children({ countUpAmount, startCountUp, finishCountUp, countUpCompleted })}
				<OnMount onmount={() => startCountUp()} />

				<CanvasSizeRectangle eventMode="none" backgroundColor={0x000000} backgroundAlpha={0.5} />

				<MainContainer>
					<Container eventMode="none" x={board.x} y={board.y}>
						<WinFrameDisplay title={winLevelData.text ?? 'TOTAL WIN'} {frameWidth} glow={isBigWin}>
							<ResponsiveBitmapText
								anchor={0.5}
								maxWidth={frameMetrics.amountMaxWidth}
								text={bookEventAmountToCurrencyString(countUpAmount)}
								style={{ fontFamily: 'silver', fontSize: frameMetrics.amountFontSize, align: 'center' }}
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
