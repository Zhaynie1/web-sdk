<script lang="ts">
	import { Container, Graphics, Text } from 'pixi-svelte';
	import { Button } from 'components-pixi';

	import { drawVineCircleButton } from './draw/drawVineButton';
	import { THEME } from '$starpetal/config/theme';

	// Buy-bonus button: a vine circle with "BUY BONUS" lettering (gold normally, vine
	// when a feature is active, greyed when disabled). Mirrors the original labeled
	// button rather than the plain glyph icon.
	type Props = {
		x?: number;
		y?: number;
		size?: number;
		active?: boolean;
		disabled?: boolean;
		onpress: () => void;
	};

	const props: Props = $props();

	const buttonSize = $derived(props.size ?? 104);
	const sizes = $derived({ width: buttonSize, height: buttonSize });
	const radius = $derived(buttonSize * 0.5);
	const labelLines = ['BUY', 'BONUS'];
	const fontSize = $derived(buttonSize * 0.155);
	const lineGap = $derived(fontSize * 1.05);
</script>

<Button x={props.x} y={props.y} anchor={0.5} {sizes} onpress={props.onpress} disabled={props.disabled}>
	{#snippet children({ center, hovered })}
		<Container {...center}>
			<Graphics
				scale={hovered && !props.disabled ? 1.03 : 1}
				draw={(g) =>
					drawVineCircleButton(g, radius, {
						disabled: props.disabled,
						hovered: hovered && !props.disabled,
						glow: props.active,
					})}
			/>
			{#each labelLines as line, index}
				<Text
					anchor={0.5}
					resolution={3}
					y={(index - (labelLines.length - 1) * 0.5) * lineGap}
					text={line}
					style={{
						align: 'center',
						fontFamily: 'proxima-nova, Impact, sans-serif',
						fontWeight: '900',
						fontSize,
						fill: props.disabled ? 0x666678 : props.active ? THEME.vine : THEME.gold,
						stroke: { color: THEME.bgDeep, width: 3 },
					}}
				/>
			{/each}
		</Container>
	{/snippet}
</Button>
