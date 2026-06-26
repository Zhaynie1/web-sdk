<script lang="ts">
	import { Container, Graphics, Text } from 'pixi-svelte';
	import { stateBet } from 'state-shared';
	import { UI_BASE_SIZE } from 'components-ui-pixi/src/constants';
	import { THEME } from '../../game/theme';
	import { drawVineCircleButton } from '../../game/drawVineButton';

	const radius = UI_BASE_SIZE * 0.45;

	const fontSizeMultiplier = $derived.by(() => {
		if (stateBet.autoSpinsCounter === Infinity) return 3;
		if (stateBet.autoSpinsCounter > 99) return 1.5;
		if (stateBet.autoSpinsCounter > 9) return 2;
		return 2.5;
	});
</script>

{#if stateBet.autoSpinsCounter > 0}
	<Container>
		<Graphics draw={(g) => drawVineCircleButton(g, radius, { glow: true })} />
		<Text
			anchor={0.5}
			text={stateBet.autoSpinsCounter === Infinity ? '∞' : stateBet.autoSpinsCounter}
			style={{
				fontFamily: 'proxima-nova, Impact, sans-serif',
				fill: THEME.gold,
				fontWeight: '900',
				fontSize: fontSizeMultiplier * UI_BASE_SIZE * 0.2,
				stroke: { color: THEME.bgDeep, width: 3 },
			}}
		/>
	</Container>
{/if}