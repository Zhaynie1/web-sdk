<script lang="ts" module>
	export type EmitterEventFreeSpinIntro =
		| { type: 'freeSpinIntroShow' }
		| { type: 'freeSpinIntroHide' }
		| { type: 'freeSpinIntroUpdate'; totalFreeSpins: number };
</script>

<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { FadeContainer } from 'components-pixi';
	import { Container, Text } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import { freeSpinIntroPressGate } from '../game/bonusPanelPress';
	import { PANEL_TEXT_RESOLUTION } from '../game/panelText';
	import { THEME } from '../game/theme';
	import { getIntroPanelLayout, getWinFrameMetrics } from '../game/winFrameLayout';
	import PressToContinue from './PressToContinue.svelte';
	import SharpSilverBitmapText from './SharpSilverBitmapText.svelte';
	import WinFrameDisplay from './WinFrameDisplay.svelte';

	const context = getContext();

	let show = $state(false);
	let freeSpinsFromEvent = $state(0);
	let pressEnabled = $state(false);

	const board = $derived(context.stateGameDerived.boardLayout());
	const frameWidth = $derived(board.width * 0.56);
	const metrics = $derived(getWinFrameMetrics(frameWidth, 'intro'));
	const introLayout = $derived(getIntroPanelLayout(metrics));

	context.eventEmitter.subscribeOnMount({
		freeSpinIntroShow: () => (show = true),
		freeSpinIntroHide: () => {
			show = false;
			pressEnabled = false;
		},
		freeSpinIntroUpdate: (emitterEvent) => {
			freeSpinsFromEvent = emitterEvent.totalFreeSpins;
			pressEnabled = false;
			setTimeout(() => {
				pressEnabled = true;
			}, 500);
		},
	});
</script>

<FadeContainer {show} duration={180} zIndex={20}>
	<MainContainer>
		<Container x={board.x} y={board.y}>
			<WinFrameDisplay
				title="CONGRATULATIONS"
				subtitle="YOU WON"
				layout="intro"
				{frameWidth}
				solidBackground
				compactBorder
			>
				<Container>
					<SharpSilverBitmapText
						anchor={0.5}
						y={introLayout.spinCountY}
						targetFontSize={metrics.amountFontSize}
						text={String(freeSpinsFromEvent)}
					/>
					<Text
						anchor={0.5}
						resolution={PANEL_TEXT_RESOLUTION}
						y={introLayout.freeSpinsLabelY}
						text="FREE SPINS"
						style={{
							fontFamily: 'proxima-nova, Impact, sans-serif',
							fontSize: metrics.labelFontSize,
							fontWeight: '900',
							fill: THEME.silver,
							stroke: { color: THEME.silverStroke, width: 3 },
							align: 'center',
							letterSpacing: 1,
						}}
					/>
				</Container>
			</WinFrameDisplay>
		</Container>
	</MainContainer>

	<PressToContinue
		disabled={!pressEnabled}
		onpress={() => freeSpinIntroPressGate.tryConfirm()}
	/>
</FadeContainer>