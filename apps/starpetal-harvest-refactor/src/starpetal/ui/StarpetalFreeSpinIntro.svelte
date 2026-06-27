<script lang="ts">
	import { MainContainer, CanvasSizeRectangle } from 'components-layout';
	import { FadeContainer } from 'components-pixi';
	import { Container, Text, BitmapText } from 'pixi-svelte';
	import { waitForResolve } from 'utils-shared/wait';

	import { getContext } from '$game/context';
	import { THEME } from '$starpetal/config/theme';
	import PressToContinue from '$components/PressToContinue.svelte';
	import WinFrameDisplay from './panels/WinFrameDisplay.svelte';
	import { getWinFrameMetrics, getIntroPanelLayout } from './panels/winFrameLayout';

	// Starpetal free-spin intro: vine plaque with "CONGRATULATIONS / YOU WON / N /
	// FREE SPINS" in silver, replacing the cluster's localised sprite + gold spine.
	const context = getContext();

	let show = $state(false);
	let freeSpinsFromEvent = $state(0);
	let oncomplete = $state(() => {});

	context.eventEmitter.subscribeOnMount({
		freeSpinIntroShow: () => (show = true),
		freeSpinIntroHide: () => (show = false),
		freeSpinIntroUpdate: async (emitterEvent) => {
			freeSpinsFromEvent = emitterEvent.totalFreeSpins;
			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});

	const board = $derived(context.stateGameDerived.boardLayout());
	const frameWidth = $derived(board.width * 0.7);
	const metrics = $derived(getWinFrameMetrics(frameWidth, 'intro'));
	const introLayout = $derived(getIntroPanelLayout(metrics));
</script>

<FadeContainer {show} duration={180} zIndex={20}>
	<CanvasSizeRectangle backgroundColor={0x000000} backgroundAlpha={0.5} />
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
					<BitmapText
						anchor={0.5}
						y={introLayout.spinCountY}
						text={String(freeSpinsFromEvent)}
						style={{ fontFamily: 'silver', fontSize: metrics.amountFontSize }}
					/>
					<Text
						anchor={0.5}
						resolution={2}
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

	<PressToContinue onpress={() => oncomplete()} />
</FadeContainer>
