<script lang="ts" module>
	import type { WinLevelData } from '../game/winLevelMap';

	export type EmitterEventWin =
		| { type: 'winShow' }
		| { type: 'winHide' }
		| { type: 'winUpdate'; amount: number; winLevelData: WinLevelData };
</script>

<script lang="ts">
	import { Container } from 'pixi-svelte';
	import { FadeContainer, WinCountUpProvider } from 'components-pixi';
	import { waitForResolve, waitForTimeout } from 'utils-shared/wait';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { CanvasSizeRectangle, MainContainer } from 'components-layout';
	import { OnMount } from 'components-shared';

	import SharpResponsiveSilverBitmapText from './SharpResponsiveSilverBitmapText.svelte';
	import WinCoins from './WinCoins.svelte';
	import WinFrameDisplay from './WinFrameDisplay.svelte';
	import PressToContinue from './PressToContinue.svelte';
	import { getContext } from '../game/context';
	import { capWinPresentDuration } from '../game/getCenterWinLevelData';

	import { shouldAutoAdvancePanels } from '../game/panelWait';
	import { getWinFrameMetrics } from '../game/winFrameLayout';
	import {
		getWinCelebrationFrameWidth,
		getWinCelebrationGlow,
	} from '../game/winCelebrationLayout';

	const context = getContext();

	let show = $state(false);
	let amount = $state(0);
	let winLevelData = $state<WinLevelData>();
	let oncomplete = $state(() => {});
	let onCountUpComplete = $state(() => {});
	let dismissed = $state(false);

	const stopTotalWinNoise = () => {
		context.eventEmitter.broadcast({ type: 'soundTotalWinNoiseStop' });
	};

	const dismissWin = () => {
		if (dismissed) return;
		dismissed = true;
		stopTotalWinNoise();
		oncomplete();
	};

	const handlePressToContinue = (
		countUpCompleted: boolean,
		finishCountUp: () => void,
	) => {
		if (!countUpCompleted) finishCountUp();
		dismissWin();
	};

	context.eventEmitter.subscribeOnMount({
		winShow: () => (show = true),
		winHide: () => {
			show = false;
			winLevelData = undefined;
		},
		winUpdate: async (emitterEvent) => {
			amount = emitterEvent.amount;
			winLevelData = emitterEvent.winLevelData;
			dismissed = false;
			const duration = capWinPresentDuration(
				emitterEvent.winLevelData?.presentDuration ?? 0,
			);
			if (shouldAutoAdvancePanels()) {
				await waitForTimeout(320);
				return;
			}
			await Promise.race([
				waitForResolve((resolve) => (oncomplete = resolve)),
				waitForTimeout(duration + 500),
			]);
		},
	});
</script>

<FadeContainer {show} duration={200} zIndex={25} sortableChildren>
	{#if winLevelData}
		{@const duration = capWinPresentDuration(winLevelData.presentDuration)}
		{@const board = context.stateGameDerived.boardLayout()}
		{@const frameWidth = getWinCelebrationFrameWidth(board.width)}
		{@const frameMetrics = getWinFrameMetrics(frameWidth)}
		{@const isBigWin = winLevelData.type === 'big'}
		{@const frameGlow = getWinCelebrationGlow(winLevelData)}
		{#key `${amount}-${winLevelData.level}`}
			<WinCountUpProvider
				{amount}
				{duration}
				oncomplete={() => {
					stopTotalWinNoise();
					onCountUpComplete();
				}}
			>
				{#snippet children({ countUpAmount, startCountUp, finishCountUp, countUpCompleted })}
					{#if isBigWin}
						<CanvasSizeRectangle
							eventMode="none"
							backgroundColor={0x000000}
							backgroundAlpha={0.5}
						/>
					{/if}

					<OnMount
						onmount={async () => {
							if (shouldAutoAdvancePanels()) {
								finishCountUp();
								dismissWin();
								return;
							}
						await Promise.race([startCountUp(), waitForTimeout(duration + 1000)]);
						await waitForTimeout(300);
						dismissWin();
						}}
					/>

					<MainContainer>
						<Container eventMode="none" x={board.x} y={board.y}>
							<WinFrameDisplay
								title={winLevelData.text}
								{frameWidth}
								glow={frameGlow}
							>
								<SharpResponsiveSilverBitmapText
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
						<PressToContinue
							onpress={() =>
								handlePressToContinue(countUpCompleted, finishCountUp)}
						/>
					</Container>
				{/snippet}
			</WinCountUpProvider>
		{/key}
	{/if}
</FadeContainer>