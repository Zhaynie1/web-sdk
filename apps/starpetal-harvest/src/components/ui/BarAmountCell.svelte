<script lang="ts">
	import { Container, Graphics, Text } from 'pixi-svelte';

	import { drawBottomBarAmountCell } from '../../game/drawBottomBar';
	import { estimateCurrencyTextWidth } from '../../game/layoutConstants';
	import { THEME } from '../../game/theme';

	type Props = {
		label: string;
		value: string;
		width?: number;
		height?: number;
		interactive?: boolean;
		disabled?: boolean;
		onpress?: () => void;
	};

	const props: Props = $props();

	const cellWidth = $derived(props.width ?? 108);
	const cellHeight = $derived(props.height ?? 52);
	const labelSize = $derived(Math.round(cellHeight * 0.28));
	const baseValueSize = $derived(Math.round(cellHeight * 0.38));
	const valueSize = $derived.by(() => {
		const available = cellWidth - 12;
		const estimated = estimateCurrencyTextWidth(props.value, baseValueSize);
		if (estimated <= available) return baseValueSize;
		return Math.max(
			Math.round(cellHeight * 0.28),
			Math.floor(baseValueSize * (available / estimated)),
		);
	});
</script>

<Container
	eventMode={props.interactive && !props.disabled ? 'static' : 'passive'}
	cursor={props.interactive && !props.disabled ? 'pointer' : 'default'}
	onpointerup={() => {
		if (props.interactive && !props.disabled) props.onpress?.();
	}}
>
	<Graphics
		draw={(g) => drawBottomBarAmountCell(g, cellWidth, cellHeight)}
		alpha={props.disabled ? 0.65 : 1}
	/>
	<Text
		anchor={{ x: 0.5, y: 0 }}
		y={-cellHeight * 0.5 + 6}
		text={props.label}
		style={{
			fontFamily: 'proxima-nova, system-ui, sans-serif',
			fontSize: labelSize,
			fontWeight: '700',
			fill: THEME.petal,
			letterSpacing: 0.5,
		}}
	/>
	<Text
		anchor={{ x: 0.5, y: 0 }}
		y={-cellHeight * 0.5 + labelSize + 10}
		text={props.value}
		style={{
			fontFamily: 'proxima-nova, system-ui, sans-serif',
			fontSize: valueSize,
			fontWeight: '700',
			fill: THEME.starlight,
			stroke: { color: THEME.bgDeep, width: 2 },
		}}
	/>
</Container>