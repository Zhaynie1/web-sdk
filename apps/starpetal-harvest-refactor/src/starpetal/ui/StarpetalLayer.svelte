<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { Sprite } from 'pixi-svelte';

	import { LEFT_COLUMN } from '$starpetal/ui/leftColumnLayout';

	// Starpetal left column — just the title logo, top-left. (The left tumble-win
	// feature window was removed per design.)
	const LEFT_CX = LEFT_COLUMN.centerX;
	const LOGO_W = LEFT_COLUMN.logoW;
	const LOGO_H = LEFT_COLUMN.logoH;
	const LOGO_Y = LEFT_COLUMN.logoY;
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
</MainContainer>
