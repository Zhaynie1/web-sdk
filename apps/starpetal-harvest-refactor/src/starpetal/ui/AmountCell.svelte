<script lang="ts">
	import { Container, Graphics, Text } from 'pixi-svelte';

	import { drawBottomBarAmountCell } from './draw/drawBottomBar';
	import { THEME } from '../config/theme';

	// A vine amount cell (label + value) centred at (0,0). The value auto-fits: large
	// amounts (up to $100,000,000.00) shrink to stay inside the cell, and scale back up
	// as the number gets shorter — measured live, so it adjusts as the balance changes.
	type Props = { label: string; value: string; width?: number; height?: number };
	const props: Props = $props();
	const w = $derived(props.width ?? 250);
	const h = $derived(props.height ?? 104);

	let valueWidth = $state(0);
	const valueScale = $derived(Math.min(1, (w * 0.9) / (valueWidth || 1)));
</script>

<Graphics draw={(g) => drawBottomBarAmountCell(g, w, h)} />
<Text
	anchor={0.5}
	y={-h * 0.21}
	text={props.label}
	style={{ fontFamily: 'proxima-nova, sans-serif', fontWeight: '700', fontSize: 24, fill: THEME.mist }}
/>
<Container y={h * 0.17} scale={valueScale}>
	<Text
		anchor={0.5}
		text={props.value}
		onresize={(sizes) => (valueWidth = sizes.width)}
		style={{ fontFamily: 'proxima-nova, sans-serif', fontWeight: '900', fontSize: 40, fill: THEME.silver }}
	/>
</Container>
