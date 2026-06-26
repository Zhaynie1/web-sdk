<script lang="ts">
	import { Container } from 'pixi-svelte';

	import { silverBitmapScale } from '../game/panelText';
	import SharpSilverBitmapText from './SharpSilverBitmapText.svelte';

	type Props = {
		text: string;
		targetFontSize: number;
		maxWidth: number;
		anchor?: number | { x: number; y: number };
		x?: number;
		y?: number;
	};

	const props: Props = $props();
	let measuredWidth = $state(0);
	const baseScale = $derived(silverBitmapScale(props.targetFontSize));
	const fitScale = $derived(Math.min(props.maxWidth / (measuredWidth || 1), 1));
	const scale = $derived(baseScale * fitScale);
</script>

<Container visible={false}>
	<SharpSilverBitmapText
		text={props.text}
		targetFontSize={props.targetFontSize}
		onresize={(sizes) => (measuredWidth = sizes.width * baseScale)}
	/>
</Container>

<SharpSilverBitmapText
	anchor={props.anchor}
	text={props.text}
	targetFontSize={props.targetFontSize}
	x={props.x}
	y={props.y}
	{scale}
/>