<script lang="ts">
	import { onMount } from 'svelte';
	import { Container, Sprite, Text } from 'pixi-svelte';

	import { getMaxWinLabelLayout } from '../../game/logoConstants';
	import { preloadStarpetalFonts } from '../../game/preloadFonts';
	import { MAX_WIN_TEXT_RESOLUTION } from '../../game/panelText';
	import { MAX_WIN_AMOUNT_LABEL, MAX_WIN_CAP_LABEL } from '../../game/theme';

	type Props = {
		x?: number;
		y?: number;
		scale?: number;
		showMaxWinLabel?: boolean;
	};

	const props: Props = $props();
	const scale = $derived(props.scale ?? 1);
	const showMaxWinLabel = $derived(props.showMaxWinLabel ?? true);
	const layout = $derived(getMaxWinLabelLayout(scale));
	let displayFontReady = $state(!showMaxWinLabel);

	onMount(async () => {
		if (!showMaxWinLabel) return;
		await preloadStarpetalFonts();
		displayFontReady = true;
	});

	const whiteDisplayStyle = {
		fontFamily: '"Bebas Neue", Impact, sans-serif',
		fontWeight: '400' as const,
		fill: 0xffffff,
		align: 'center' as const,
	};
</script>

<Container x={props.x} y={props.y}>
	<Sprite
		key="starpetalForestLogo"
		anchor={{ x: 0.5, y: 0 }}
		width={layout.logoWidth}
		height={layout.logoHeight}
	/>
	{#if showMaxWinLabel && displayFontReady}
		<Container y={layout.maxWinOffsetY}>
			<Text
				anchor={0.5}
				resolution={MAX_WIN_TEXT_RESOLUTION}
				roundPixels
				y={layout.amountY}
				text={MAX_WIN_AMOUNT_LABEL}
				style={{
					...whiteDisplayStyle,
					fontSize: layout.amountFontSize,
					letterSpacing: 2,
				}}
			/>
			<Text
				anchor={0.5}
				resolution={MAX_WIN_TEXT_RESOLUTION}
				roundPixels
				y={layout.capY}
				text={MAX_WIN_CAP_LABEL}
				style={{
					...whiteDisplayStyle,
					fontSize: layout.capFontSize,
					letterSpacing: 6,
				}}
			/>
		</Container>
	{/if}
</Container>