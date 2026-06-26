<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { getContextLayout } from 'utils-layout';
	import type { LayoutUiProps } from 'components-ui-pixi';

	import {
		getLeftColumnCenterX,
		getLeftColumnWidth,
		getLeftFeaturePanelLayout,
	} from '../../game/layoutConstants';
	import GameTitleLogo from './GameTitleLogo.svelte';
	import LeftFeaturePanel from './LeftFeaturePanel.svelte';

	const props: LayoutUiProps = $props();
	const { stateLayoutDerived } = getContextLayout();

	const layoutType = $derived(stateLayoutDerived.layoutType());
	const isPortrait = $derived(layoutType === 'portrait');
	const mainStandard = $derived(stateLayoutDerived.mainLayoutStandard());

	const leftCenterX = $derived(getLeftColumnCenterX(layoutType, mainStandard.width));
	const leftColumnWidth = $derived(getLeftColumnWidth(layoutType, mainStandard.width));
	const titleScale = $derived(isPortrait ? 0.58 : 0.92);
	const featurePanel = $derived(
		getLeftFeaturePanelLayout(layoutType, leftColumnWidth, isPortrait),
	);

	const logoY = 8;
</script>

<!-- Logo + feature panel (top-aligned standard space) -->
<MainContainer standard alignHorizontal="left">
	<GameTitleLogo x={leftCenterX} y={logoY} scale={titleScale} showMaxWinLabel={false} />

	{#if !isPortrait}
		<LeftFeaturePanel
			x={featurePanel.x}
			y={featurePanel.y}
			width={featurePanel.width}
			height={featurePanel.height}
			anchorBottom
		/>
	{/if}
</MainContainer>