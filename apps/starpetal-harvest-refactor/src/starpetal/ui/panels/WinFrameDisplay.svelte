<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Container, Graphics, Sprite, Text } from 'pixi-svelte';

	import { getContext } from '$game/context';
	import { THEME } from '$starpetal/config/theme';
	import { drawVineWinPanel } from '$starpetal/ui/draw/drawVineWinPanel';
	import { getIntroPanelLayout, getWinFrameMetrics, type WinFrameLayout } from './winFrameLayout';

	/** Internal Text resolution for crisp win / free-spin labels at 1080p+. */
	const PANEL_TEXT_RESOLUTION = 2;

	/** Frame style: the `starpetalWinFrame` art sprite, or the procedural vine
	 * plaque (drawVineWinPanel). Flip to `false` to use the drawn vine window. */
	const USE_SPRITE_FRAME = true;

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
	const resolvedFrameWidth = $derived(props.frameWidth ?? mainLayout.width * (props.sizeScale ?? 0.44));
	const layout = $derived(props.layout ?? 'default');
	const metrics = $derived(getWinFrameMetrics(resolvedFrameWidth, layout));
	const introLayout = $derived(layout === 'intro' ? getIntroPanelLayout(metrics) : null);
</script>

<Container>
	{#if USE_SPRITE_FRAME}
		<Sprite key="starpetalWinFrame" anchor={0.5} width={metrics.frameWidth} height={metrics.frameHeight} />
	{:else}
		<Graphics
			draw={(g) =>
				drawVineWinPanel(g, metrics.frameWidth, metrics.frameHeight, {
					glow: props.glow ?? false,
					solid: props.solidBackground ?? false,
					compact: props.compactBorder ?? false,
				})}
		/>
	{/if}

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
				stroke: { color: THEME.silverStroke, width: props.layout === 'default' ? 5 : 3 },
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
