<script lang="ts">
	import { Graphics, Text } from 'pixi-svelte';

	import { drawBottomBarAmountCell } from './draw/drawBottomBar';
	import { THEME } from '../config/theme';

	// A vine amount cell (label + value) centred at (0,0).
	type Props = { label: string; value: string; width?: number; height?: number };
	const props: Props = $props();
	const w = $derived(props.width ?? 250);
	const h = $derived(props.height ?? 104);
</script>

<Graphics draw={(g) => drawBottomBarAmountCell(g, w, h)} />
<Text
	anchor={0.5}
	y={-h * 0.21}
	text={props.label}
	style={{ fontFamily: 'proxima-nova, sans-serif', fontWeight: '700', fontSize: 24, fill: THEME.mist }}
/>
<Text
	anchor={0.5}
	y={h * 0.17}
	text={props.value}
	style={{ fontFamily: 'proxima-nova, sans-serif', fontWeight: '900', fontSize: 40, fill: THEME.silver }}
/>
