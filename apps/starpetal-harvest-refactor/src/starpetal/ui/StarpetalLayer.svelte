<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { Container, Graphics, Sprite } from 'pixi-svelte';

	import { getContext } from '$game/context';
	import { drawVineWinPanel } from '$starpetal/ui/draw/drawVineWinPanel';
	import { LEFT_COLUMN } from '$starpetal/ui/leftColumnLayout';
	import LeftMultiplierPanel from './LeftMultiplierPanel.svelte';

	// Starpetal left column — title logo top-left + a vine feature window below it
	// (landscape only), echoing what the original was going for. Positioned in the
	// standardized space, left-aligned to the canvas edge so it sits in the margin
	// to the left of the (centred) board. Shared geometry in leftColumnLayout keeps
	// the logo, free-spin counter slot, and window from overlapping.
	const context = getContext();
	const isLandscape = $derived(
		['desktop', 'landscape'].includes(context.stateLayoutDerived.layoutType()),
	);
	const isFreeGame = $derived(context.stateGame.gameType === 'freegame');

	// left-column geometry (standard space)
	const LEFT_CX = LEFT_COLUMN.centerX;
	const LOGO_W = LEFT_COLUMN.logoW;
	const LOGO_H = LEFT_COLUMN.logoH;
	const LOGO_Y = LEFT_COLUMN.logoY;

	const WIN_W = LEFT_COLUMN.winW;
	const WIN_H = LEFT_COLUMN.winH;
	// Window sits under the logo in base game; shifts down to clear the free-spin
	// counter slot in free game (the swap is hidden by the free-spin transition).
	const WIN_TOP = $derived(LEFT_COLUMN.winTop(isFreeGame));
</script>

<MainContainer standard alignHorizontal="left">
	<!-- title logo, top-left -->
	<Sprite
		key="starpetalLogo"
		x={LEFT_CX}
		y={LOGO_Y}
		width={LOGO_W}
		height={LOGO_H}
		anchor={{ x: 0.5, y: 0 }}
	/>

	<!-- vine feature window below the logo (landscape only) -->
	{#if isLandscape}
		<Container x={LEFT_CX} y={WIN_TOP + WIN_H / 2}>
			<Graphics draw={(g) => drawVineWinPanel(g, WIN_W, WIN_H, { glow: true })} />
			<LeftMultiplierPanel width={WIN_W - 36} height={WIN_H - 28} />
		</Container>
	{/if}
</MainContainer>
