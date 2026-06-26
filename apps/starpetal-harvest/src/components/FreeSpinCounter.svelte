<script lang="ts" module>
	export type EmitterEventFreeSpinCounter =
		| { type: 'freeSpinCounterShow' }
		| { type: 'freeSpinCounterHide' }
		| { type: 'freeSpinCounterUpdate'; current?: number; total?: number };
</script>

<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { FadeContainer } from 'components-pixi';
	import { Container } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import { getFreeSpinCounterPosition } from '../game/layoutConstants';
	import { getFreeSpinCounterPanelLayout, getWinFrameMetrics } from '../game/winFrameLayout';
	import SharpSilverBitmapText from './SharpSilverBitmapText.svelte';
	import WinFrameDisplay from './WinFrameDisplay.svelte';

	const context = getContext();

	const layoutType = $derived(context.stateLayoutDerived.layoutType());
	const mainStandard = $derived(context.stateLayoutDerived.mainLayoutStandard());
	const layout = $derived(getFreeSpinCounterPosition(layoutType, mainStandard.width));
	const metrics = $derived(getWinFrameMetrics(layout.frameWidth, 'compact'));
	const countFontSize = $derived(
		metrics.amountFontSize *
			Math.min(1, (metrics.amountMaxWidth / Math.max(metrics.amountFontSize * 4.2, 1)) * 0.95),
	);
	const textLayout = $derived(getFreeSpinCounterPanelLayout(metrics, countFontSize));

	let show = $state(false);
	let current = $state(0);
	let total = $state(0);

	context.eventEmitter.subscribeOnMount({
		freeSpinCounterShow: () => (show = true),
		freeSpinCounterHide: () => (show = false),
		freeSpinCounterUpdate: (emitterEvent) => {
			if (emitterEvent.current !== undefined) current = emitterEvent.current;
			if (emitterEvent.total !== undefined) total = emitterEvent.total;
		},
	});
</script>

<MainContainer standard alignHorizontal="left">
	<FadeContainer {show} duration={300} zIndex={12}>
		<Container x={layout.centerX} y={layout.centerY}>
			<WinFrameDisplay frameWidth={layout.frameWidth} layout="compact">
				<Container>
					<SharpSilverBitmapText
						anchor={0.5}
						x={0}
						y={textLayout.labelY}
						targetFontSize={metrics.labelFontSize}
						text="FREE SPIN"
					/>
					<SharpSilverBitmapText
						anchor={0.5}
						x={0}
						y={textLayout.countY}
						targetFontSize={countFontSize}
						text={`${current} OF ${total}`}
					/>
				</Container>
			</WinFrameDisplay>
		</Container>
	</FadeContainer>
</MainContainer>