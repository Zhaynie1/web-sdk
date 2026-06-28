<script lang="ts" module>
	import { FillGradient } from 'pixi.js'; // app declares pixi.js@8.8.1 (same as pixi-svelte → one instance)

	// Glossy starlight-violet gradient, shared by every instance. `textureSpace: 'local'`
	// maps the 0..1 stops to each text's own bounds, so one instance works at any size:
	// bright white crown → pale violet → mid violet → deeper violet foot = a glossy metal.
	const GLOSS_FILL = new FillGradient({
		type: 'linear',
		start: { x: 0, y: 0 },
		end: { x: 0, y: 1 },
		colorStops: [
			{ offset: 0, color: 0xffffff },
			{ offset: 0.42, color: 0xeadfff },
			{ offset: 0.52, color: 0xceb6f3 },
			{ offset: 1, color: 0x9d7fd6 },
		],
		textureSpace: 'local',
	});
</script>

<script lang="ts">
	import { Container, Text } from 'pixi-svelte';

	// Glossy number for all cluster / multiplier / win-screen money (NOT balance/win/bet).
	// Rendered as clean canvas text — NOT the `mm_silver` bitmap atlas, whose glyphs carry
	// the Stake/miner preset "cuts". Clean heavy font + the violet gloss gradient + a dark
	// outline and drop shadow give a premium glossy digit. (Name kept as SilverText so the
	// existing call sites don't need to change.)
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
	// Render at the display size (crisp), then scale the wrapper down only if it would
	// overflow maxWidth.
	const fitScale = $derived(Math.min(props.maxWidth / (measuredWidth || props.maxWidth), 1));
	const anchor = $derived(props.anchor ?? 0.5);

	const style = $derived({
		fontFamily: 'proxima-nova, Impact, sans-serif',
		fontWeight: '900' as const,
		fontSize: props.targetFontSize,
		fill: GLOSS_FILL,
		stroke: {
			color: 0x281052,
			width: Math.max(2, props.targetFontSize * 0.08),
			join: 'round' as const,
		},
		dropShadow: {
			color: 0x140a28,
			alpha: 0.55,
			blur: 2,
			angle: Math.PI / 2,
			distance: Math.max(1, props.targetFontSize * 0.06),
		},
		align: 'center' as const,
	});
</script>

<Container x={props.x} y={props.y} scale={fitScale}>
	<Text {anchor} {style} resolution={2} text={props.text} onresize={(sizes) => (measuredWidth = sizes.width)} />
</Container>
