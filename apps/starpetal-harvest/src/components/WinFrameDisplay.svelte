<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Container, Graphics, Text } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import { drawVineWinPanel } from '../game/drawVineWinPanel';
	import { PANEL_TEXT_RESOLUTION } from '../game/panelText';
	import { THEME } from '../game/theme';
	import {
		getIntroPanelLayout,
		getWinFrameMetrics,
		type WinFrameLayout,
	} from '../game/winFrameLayout';

	type Props = {
		title?: string | null;
		subtitle?: string | null;
		/** Width in layout pixels; overrides sizeScale when set. */
		frameWidth?: number;
		sizeScale?: number;
		layout?: WinFrameLayout;
		glow?: boolean;
		solidBackground?: boolean;
		compactBorder?: boolean;
		children: Snippet;
	};

	const props: Props = $props();
	const context = getContext();

	const mainLayout = $derived(context.stateLayoutDerived.mainLayout());
	const resolvedFrameWidth = $derived(
		props.frameWidth ?? mainLayout.width * (props.sizeScale ?? 0.44),
	);
	const layout = $derived(props.layout ?? 'default');
	const metrics = $derived(getWinFrameMetrics(resolvedFrameWidth, layout));
	const introLayout = $derived(layout === 'intro' ? getIntroPanelLayout(metrics) : null);
	const frameGlow = $derived(props.glow ?? false);
</script>

<Container>
	<Graphics
		draw={(g) =>
			drawVineWinPanel(g, metrics.frameWidth, metrics.frameHeight, {
					glow: frameGlow,
					solid: props.solidBackground ?? false,
					compact: props.compactBorder ?? false,
				})}
	/>

	{#if props.title}
		<Text
			anchor={0.5}
			resolution={PANEL_TEXT_RESOLUTION}
			y={introLayout?.titleY ?? -metrics.frameHeight * (layout === 'compact' ? 0.18 : 0.19)}
			text={props.title}
			style={{
				fontFamily: 'proxima-nova, Impact, sans-serif',
				fontSize: metrics.titleFontSize,
				fontWeight: '900',
				fill: THEME.silver,
				stroke: {
					color: THEME.silverStroke,
					width: props.layout === 'default' ? 5 : 3,
				},
				align: 'center',
				letterSpacing: 1,
			}}
		/>
	{/if}

	{#if props.subtitle}
		<Text
			anchor={0.5}
			resolution={PANEL_TEXT_RESOLUTION}
			y={introLayout?.subtitleY ?? -metrics.frameHeight * (layout === 'compact' ? 0.07 : 0.075)}
			text={props.subtitle}
			style={{
				fontFamily: 'proxima-nova, Georgia, serif',
				fontSize: metrics.subtitleFontSize,
				fontWeight: '600',
				fill: THEME.silver,
				align: 'center',
				letterSpacing: 0.5,
			}}
		/>
	{/if}

	<Container y={layout === 'intro' ? 0 : metrics.frameHeight * 0.02}>
		{@render props.children()}
	</Container>
</Container>