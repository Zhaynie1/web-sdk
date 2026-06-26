<script lang="ts">
	import { Container, Graphics } from 'pixi-svelte';

	import { getContext } from '../../game/context';
	import { drawVinePanelBorder, fillVinePanelBackground } from '../../game/drawVineReelFrame';
	import LeftMultiplierPanel from './LeftMultiplierPanel.svelte';

	type Props = {
		x?: number;
		y?: number;
		width?: number;
		height?: number;
		/** When true, `y` is the bottom edge (aligned with slot grid bottom). */
		anchorBottom?: boolean;
	};

	const props: Props = $props();
	const context = getContext();

	let glow = $state(false);

	context.eventEmitter.subscribeOnMount({
		boardFrameGlowShow: () => {
			glow = true;
		},
		boardFrameGlowHide: () => {
			glow = false;
		},
	});

	const width = $derived(Math.max(props.width ?? 280, 1));
	const height = $derived(Math.max(props.height ?? 300, 1));
	const peakH = 10;
	const frameInset = 4;
</script>

<Container x={props.x} y={props.y}>
	<Graphics
		draw={(g) => {
			g.clear();
			const panelWidth = width;
			const panelHeight = height;
			const anchorBottom = props.anchorBottom ?? false;
			const hw = panelWidth / 2;
			const top = anchorBottom ? -panelHeight : -panelHeight / 2;
			const bottom = anchorBottom ? 0 : panelHeight / 2;

			fillVinePanelBackground(g, { hw, top, bottom, peakH, frameInset, glow });
			drawVinePanelBorder(g, { hw, top, bottom, peakH, frameInset, glow });
		}}
	/>

	<LeftMultiplierPanel
		x={0}
		y={props.anchorBottom ? -height / 2 : 0}
		width={width - 24}
		{height}
	/>
</Container>