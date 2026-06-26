<script lang="ts" module>
	import type { WinLevelData } from '../game/winLevelMap';

	export type EmitterEventFreeSpinOutro =
		| { type: 'freeSpinOutroShow' }
		| { type: 'freeSpinOutroHide' }
		| { type: 'freeSpinOutroCountUp'; amount: number; winLevelData: WinLevelData };
</script>

<script lang="ts">
	import { Container } from 'pixi-svelte';
	import { FadeContainer, WinCountUpProvider } from 'components-pixi';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { CanvasSizeRectangle, MainContainer } from 'components-layout';
	import { OnMount } from 'components-shared';

	import { getContext } from '../game/context';
	import { freeSpinOutroPressGate } from '../game/bonusPanelPress';
	import { capWinPresentDuration } from '../game/getCenterWinLevelData';
	import { getWinFrameMetrics } from '../game/winFrameLayout';
	import {
		getWinCelebrationFrameWidth,
		getWinCelebrationGlow,
	} from '../game/winCelebrationLayout';
	import PressToContinue from './PressToContinue.svelte';
	import SharpResponsiveSilverBitmapText from './SharpResponsiveSilverBitmapText.svelte';
	import WinCoins from './WinCoins.svelte';
	import WinFrameDisplay from './WinFrameDisplay.svelte';

	const context = getContext();

	let show = $state(false);
	let amount = $state(0);
	let winLevelData = $state<WinLevelData>();
	let onCountUpComplete = $state(() => {});
	let dismissed = $state(false);
	let pressEnabled = $state(false);

	const stopTotalWinNoise = () => {
		context.eventEmitter.broadcast({ type: 'soundTotalWinNoiseStop' });
	};

	const dismissOutro = () => {
		if (dismissed) return;
		dismissed = true;
		stopTotalWinNoise();
		freeSpinOutroPressGate.tryConfirm();
	};

	const handlePressToContinue = (
		countUpCompleted: boolean,
		finishCountUp: () => void,
	) => {
		if (!countUpCompleted) finishCountUp();
		dismissOutro();
	};

	context.eventEmitter.subscribeOnMount({
		freeSpinOutroShow: () => (show = true),
		freeSpinOutroHide: () => {
			show = false;
			winLevelData = undefined;
			pressEnabled = false;
		},
		freeSpinOutroCountUp: async (emitterEvent) => {
			amount = emitterEvent.amount;
			winLevelData = emitterEvent.winLevelData;
			dismissed = false;
			pressEnabled = false;
			freeSpinOutroPressGate.arm();
			setTimeout(() => {
				pressEnabled = true;
			}, 500);
			await freeSpinOutroPressGate.waitForPress();
		},
	});
</script>

<FadeContainer {show} duration={200} zIndex={30} sortableChildren>
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
							await startCountUp();
						}}
					/>

					<MainContainer>
						<Container eventMode="none" x={board.x} y={board.y}>
							<WinFrameDisplay
								title={winLevelData.text ?? 'TOTAL WIN'}
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
							disabled={!pressEnabled}
							onpress={() =>
								handlePressToContinue(countUpCompleted, finishCountUp)}
						/>
					</Container>
				{/snippet}
			</WinCountUpProvider>
		{/key}
	{/if}
</FadeContainer>