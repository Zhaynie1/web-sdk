<script lang="ts" module>
	export type EmitterEventFreeSpinCounter =
		| { type: 'freeSpinCounterShow' }
		| { type: 'freeSpinCounterHide' }
		| { type: 'freeSpinCounterUpdate'; current?: number; total?: number };
</script>

<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { FadeContainer } from 'components-pixi';
	import { Container, Graphics, Text } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import { THEME } from '$starpetal/config/theme';
	import { drawVineWinPanel } from '$starpetal/ui/draw/drawVineWinPanel';
	import { LEFT_COLUMN } from '$starpetal/ui/leftColumnLayout';

	// Starpetal free-spin counter: procedural vine plaque + silver text, matching the
	// tumble window / multiplier badge (the cluster sample used Frame_FSCounter.png + gold).
	// Lives in the left column directly below the logo (its reserved slot), so it never
	// collides with the logo or the feature window below it.
	const context = getContext();

	const FS_W = LEFT_COLUMN.fsCounterW;
	const FS_H = LEFT_COLUMN.fsCounterH;
	const LABEL_SIZE = FS_H * 0.2;
	const COUNT_SIZE = FS_H * 0.3;

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
	<FadeContainer {show} duration={300}>
		<Container x={LEFT_COLUMN.centerX} y={LEFT_COLUMN.fsCounterCenterY}>
			<Graphics
				draw={(g) => drawVineWinPanel(g, FS_W, FS_H, { compact: true, glow: true })}
			/>
			<Text
				anchor={0.5}
				resolution={2}
				y={-FS_H * 0.2}
				text="FREE SPIN"
				style={{
					fontFamily: 'proxima-nova, Impact, sans-serif',
					fontSize: LABEL_SIZE,
					fontWeight: '900',
					fill: THEME.silver,
					stroke: { color: THEME.silverStroke, width: 3 },
					align: 'center',
					letterSpacing: 1,
				}}
			/>
			<Text
				anchor={0.5}
				resolution={2}
				y={FS_H * 0.18}
				text={`${current} OF ${total}`}
				style={{
					fontFamily: 'proxima-nova, Impact, sans-serif',
					fontSize: COUNT_SIZE,
					fontWeight: '900',
					fill: THEME.silver,
					stroke: { color: THEME.silverStroke, width: 3 },
					align: 'center',
					letterSpacing: 1,
				}}
			/>
		</Container>
	</FadeContainer>
</MainContainer>
