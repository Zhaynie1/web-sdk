<script lang="ts">
	import { stateUi } from 'state-shared';
	import { BLACK } from 'constants-shared/colors';
	import { MainContainer } from 'components-layout';
	import { Container, Graphics, Rectangle, anchorToPivot } from 'pixi-svelte';
	import { getContextLayout } from 'utils-layout';
	import type { LayoutUiProps } from 'components-ui-pixi';

	import { UI_BASE_SIZE } from 'components-ui-pixi/src/constants';

	import { getSidebarWidth } from '../../game/layoutConstants';
	import { THEME } from '../../game/theme';

	const props: LayoutUiProps = $props();
	const { stateLayoutDerived } = getContextLayout();

	const layoutType = $derived(stateLayoutDerived.layoutType());
	const isPortrait = $derived(layoutType === 'portrait');

	const panelWidth = $derived(getSidebarWidth(layoutType));
	const buttonScale = $derived(isPortrait ? 0.58 : 0.66);
	const buttonStep = $derived(108 * buttonScale);
	const labelStep = $derived(46 * (isPortrait ? 0.92 : 1));

	const mainStandard = $derived(stateLayoutDerived.mainLayoutStandard());
	const panelHeight = $derived(isPortrait ? mainStandard.height * 0.72 : mainStandard.height * 0.82);
	const panelX = $derived(isPortrait ? 10 : 18);
	const buttonCenterX = $derived(UI_BASE_SIZE * buttonScale * 0.5);
	const spinButtonScale = $derived(buttonScale * 0.82);
	const spinButtonCenterX = $derived(UI_BASE_SIZE * 0.78 * spinButtonScale * 0.5);
</script>

<Container x={panelX} y={18}>
	{@render props.gameName()}
</Container>

<Container x={stateLayoutDerived.canvasSizes().width - panelX} y={18}>
	{@render props.logo()}
</Container>

<MainContainer standard alignHorizontal="left" alignVertical="center">
	<Container
		x={panelX}
		y={mainStandard.height * 0.5}
		pivot={anchorToPivot({
			anchor: { x: 0, y: 0.5 },
			sizes: { width: panelWidth, height: panelHeight },
		})}
	>
		<Graphics
			draw={(g) => {
				g.clear();
				g.roundRect(0, 0, panelWidth, panelHeight, 16);
				g.fill({ color: THEME.bgMid, alpha: 0.88 });
				g.roundRect(0, 0, panelWidth, panelHeight, 16);
				g.stroke({ color: THEME.vine, width: 2, alpha: 0.45 });
			}}
		/>

		<Container x={16} y={20}>
			<Container y={0}>
				{@render props.amountBalance({ stacked: true })}
			</Container>

			<Container y={labelStep * 1.15}>
				{@render props.amountWin({ stacked: true })}
			</Container>

			<Container y={labelStep * 2.3}>
				{@render props.amountBet({ stacked: true })}
			</Container>

			<Container y={labelStep * 3.35}>
				<Container x={buttonCenterX} scale={buttonScale}>
					{@render props.buttonDecrease({ anchor: 0.5 })}
				</Container>
				<Container x={panelWidth - 32 - buttonCenterX} scale={buttonScale}>
					{@render props.buttonIncrease({ anchor: 0.5 })}
				</Container>
			</Container>

			<Graphics
				y={labelStep * 4.15}
				draw={(g) => {
					g.clear();
					g.moveTo(0, 0);
					g.lineTo(panelWidth - 32, 0);
					g.stroke({ color: THEME.frameGlow, width: 1, alpha: 0.35 });
				}}
			/>

			<Container x={buttonCenterX} y={labelStep * 4.45} scale={buttonScale}>
				{@render props.buttonMenu({ anchor: 0.5 })}
			</Container>

			<Container x={buttonCenterX} y={labelStep * 4.45 + buttonStep} scale={buttonScale}>
				{@render props.buttonBuyBonus({ anchor: 0.5 })}
			</Container>

			<Container x={buttonCenterX} y={labelStep * 4.45 + buttonStep * 2} scale={buttonScale}>
				{@render props.buttonAutoSpin({ anchor: 0.5 })}
			</Container>

			<Container x={spinButtonCenterX} y={labelStep * 4.45 + buttonStep * 3} scale={spinButtonScale}>
				{@render props.buttonBet({ anchor: 0.5 })}
			</Container>

			<Container x={buttonCenterX} y={labelStep * 4.45 + buttonStep * 4} scale={buttonScale}>
				{@render props.buttonTurbo({ anchor: 0.5 })}
			</Container>
		</Container>
	</Container>
</MainContainer>

{#if stateUi.menuOpen}
	<Rectangle
		eventMode="static"
		cursor="pointer"
		alpha={0.5}
		anchor={0.5}
		backgroundColor={BLACK}
		width={stateLayoutDerived.canvasSizes().width}
		height={stateLayoutDerived.canvasSizes().height}
		x={stateLayoutDerived.canvasSizes().width * 0.5}
		y={stateLayoutDerived.canvasSizes().height * 0.5}
		onpointerup={() => (stateUi.menuOpen = false)}
	/>

	<MainContainer standard alignHorizontal="left" alignVertical="center">
		<Container
			x={panelX + 16}
			y={mainStandard.height * 0.5 + panelHeight * 0.5 - 80 * buttonScale}
		>
			<Container x={buttonCenterX} scale={buttonScale} y={0}>
				{@render props.buttonPayTable({ anchor: 0.5 })}
			</Container>
			<Container x={buttonCenterX} scale={buttonScale} y={buttonStep}>
				{@render props.buttonGameRules({ anchor: 0.5 })}
			</Container>
			<Container x={buttonCenterX} scale={buttonScale} y={buttonStep * 2}>
				{@render props.buttonSettings({ anchor: 0.5 })}
			</Container>
			<Container x={buttonCenterX} scale={buttonScale} y={buttonStep * 3}>
				{@render props.buttonSoundSwitch({ anchor: 0.5 })}
			</Container>
			<Container x={buttonCenterX} scale={buttonScale} y={buttonStep * 4}>
				{@render props.buttonMenuClose({ anchor: 0.5 })}
			</Container>
		</Container>
	</MainContainer>
{/if}