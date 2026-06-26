<script lang="ts">
	import { BitmapText, type BitmapTextProps } from 'pixi-svelte';

	import { silverBitmapScale, silverBitmapStyle } from '../game/panelText';

	type Props = Omit<BitmapTextProps, 'style'> & {
		targetFontSize: number;
		style?: BitmapTextProps['style'];
	};

	const { targetFontSize, scale: scaleOverride, style, ...rest }: Props = $props();
	const scale = $derived(scaleOverride ?? silverBitmapScale(targetFontSize));
</script>

<BitmapText
	{...rest}
	{scale}
	style={{ ...silverBitmapStyle(), ...style }}
/>