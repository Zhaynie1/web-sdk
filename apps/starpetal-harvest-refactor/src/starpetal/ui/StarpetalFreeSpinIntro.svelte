<script lang="ts">
	import { MainContainer, CanvasSizeRectangle } from 'components-layout';
	import { FadeContainer } from 'components-pixi';
	import { Container, Text } from 'pixi-svelte';
	import { stateBet } from 'state-shared';
	import { SECOND } from 'constants-shared/time';
	import { waitForResolve, waitForTimeout } from 'utils-shared/wait';

	import { getContext } from '$game/context';
	import { THEME } from '$starpetal/config/theme';
	import { isLocalPlayRoute } from '../localPlay/localDemo';
	import PressToContinue from '$components/PressToContinue.svelte';
	import SilverText from './SilverText.svelte';
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
			// In autoplay (and in the offline demo, where a bought bonus is one self-
			// contained round) nobody presses, so hold briefly then auto-continue. A press
			// still skips it during real manual play.
			if (stateBet.autoSpinsCounter > 0 || isLocalPlayRoute()) {
				await waitForTimeout(SECOND * 1.6);
			} else {
				await waitForResolve((resolve) => (oncomplete = resolve));
			}
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
					<SilverText
						anchor={0.5}
						y={introLayout.spinCountY}
						maxWidth={metrics.amountMaxWidth}
						targetFontSize={metrics.amountFontSize}
						text={String(freeSpinsFromEvent)}
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
