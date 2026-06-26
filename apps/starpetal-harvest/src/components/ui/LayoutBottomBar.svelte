<script lang="ts">
	import { stateUi } from 'state-shared';
	import { BLACK } from 'constants-shared/colors';
	import { MainContainer } from 'components-layout';
	import { Container, Graphics, Rectangle } from 'pixi-svelte';
	import { getContextLayout } from 'utils-layout';
	import type { LayoutUiProps } from 'components-ui-pixi';
	import { UI_BASE_SIZE } from 'components-ui-pixi/src/constants';

	import {
		getBetAdjustButtonSize,
		getBonusBuyButtonSize,
		getBottomBarAmountCellSize,
		getBottomBarAmountsGap,
		getBottomBarAmountsPosition,
		getBottomBarAmountsSlot,
		getBottomBarIconScale,
		getBottomBarLayout,
		getBottomBarRightControls,
		getSpinButtonSize,
		getSpinClusterPosition,
	} from '../../game/layoutConstants';
	import { getContext } from '../../game/context';
	import { drawBottomBarBackground } from '../../game/drawBottomBar';
	import BarAmounts from './BarAmounts.svelte';

	const props: LayoutUiProps = $props();
	const context = getContext();
	const { stateLayoutDerived } = getContextLayout();

	let frameGlow = $state(false);

	context.eventEmitter.subscribeOnMount({
		boardFrameGlowShow: () => {
			frameGlow = true;
		},
		boardFrameGlowHide: () => {
			frameGlow = false;
		},
	});

	const layoutType = $derived(stateLayoutDerived.layoutType());
	const isPortrait = $derived(layoutType === 'portrait');
	const mainStandard = $derived(stateLayoutDerived.mainLayoutStandard());

	const bar = $derived(getBottomBarLayout(layoutType, mainStandard.width, mainStandard.height));
	const iconScale = $derived(getBottomBarIconScale(layoutType));
	const iconStep = $derived(UI_BASE_SIZE * iconScale + 8);
	const amountCell = $derived(getBottomBarAmountCellSize(layoutType));
	const spinButtonSize = $derived(getSpinButtonSize(layoutType));
	const bonusBuySize = $derived(getBonusBuyButtonSize(layoutType));
	const betAdjustSize = $derived(getBetAdjustButtonSize(layoutType));
	const spinCluster = $derived(
		getSpinClusterPosition(layoutType, mainStandard.width, mainStandard.height),
	);
	const rightControls = $derived(
		getBottomBarRightControls(
			layoutType,
			mainStandard.width,
			mainStandard.height,
			iconScale,
			bonusBuySize,
		),
	);
	const amountCellCount = $derived(
		context.stateGameDerived.isFreeSpinsFeatureActive() ? 3 : 2,
	);
	const isPortraitBonus = $derived(isPortrait && amountCellCount === 3);
	const amountsGap = $derived(
		isPortraitBonus ? 10 : getBottomBarAmountsGap(layoutType),
	);
	const amountsSlot = $derived(
		getBottomBarAmountsSlot(
			layoutType,
			mainStandard.width,
			mainStandard.height,
			iconScale,
			betAdjustSize,
			spinButtonSize,
		),
	);
	const maxAmountCellWidth = $derived(
		Math.max(
			amountCell.width,
			Math.min(
				isPortraitBonus ? amountCell.width * 1.65 : amountCell.width * 2.25,
				((isPortrait
					? bar.width - (isPortraitBonus ? 48 : 40)
					: amountsSlot.width) -
					amountsGap * (amountCellCount - 1)) /
					amountCellCount,
			),
		),
	);
	const amountsPos = $derived(
		getBottomBarAmountsPosition(
			layoutType,
			mainStandard.width,
			mainStandard.height,
			iconScale,
			betAdjustSize,
			spinButtonSize,
			amountCellCount,
		),
	);
	const betControlGap = $derived(
		spinButtonSize * 0.5 + betAdjustSize * 0.5 + (isPortrait ? 16 : 12),
	);

	const amountsRowY = $derived(
		bar.y - (isPortraitBonus ? 72 : isPortrait ? 34 : 0),
	);
	const controlsRowY = $derived(
		bar.y + (isPortraitBonus ? 24 : isPortrait ? 18 : 0),
	);
	const portraitCellNudge = $derived(
		isPortraitBonus
			? { credit: -108, win: -36, bet: 108 }
			: isPortrait
				? { credit: -28, bet: 28 }
				: undefined,
	);

	const iconsX = $derived(bar.x - bar.width * 0.5 + (isPortrait ? 20 : 36));
	const menuOverlayX = $derived(iconsX + 8);
</script>

<MainContainer standard alignHorizontal="left" alignVertical="bottom">
	<Container x={bar.x} y={bar.y}>
		<Graphics draw={(g) => drawBottomBarBackground(g, bar.width, bar.height, frameGlow)} />
	</Container>

	<Container x={iconsX} y={controlsRowY}>
		<Container scale={iconScale}>
			{@render props.buttonMenu({ anchor: 0.5 })}
		</Container>
		<Container x={iconStep} scale={iconScale}>
			{@render props.buttonPayTable({ anchor: 0.5 })}
		</Container>
		<Container x={iconStep * 2} scale={iconScale}>
			{@render props.buttonSoundSwitch({ anchor: 0.5 })}
		</Container>
	</Container>

	<Container x={isPortrait ? bar.x : amountsPos.x} y={isPortrait ? amountsRowY : amountsPos.y}>
		<BarAmounts
			minCellWidth={amountCell.width}
			maxCellWidth={maxAmountCellWidth}
			cellHeight={amountCell.height}
			gap={amountsGap}
			cellNudge={portraitCellNudge}
		/>
	</Container>

	<Container x={spinCluster.x} y={isPortrait ? controlsRowY : spinCluster.y}>
		<Container x={-betControlGap}>
			{@render props.buttonDecrease({ anchor: 0.5, size: betAdjustSize })}
		</Container>
		<Container>
			{@render props.buttonBet({ anchor: 0.5, size: spinButtonSize })}
		</Container>
		<Container x={betControlGap}>
			{@render props.buttonIncrease({ anchor: 0.5, size: betAdjustSize })}
		</Container>
	</Container>

	<Container x={rightControls.bonus.x} y={isPortrait ? controlsRowY : rightControls.bonus.y}>
		{@render props.buttonBuyBonus({ anchor: 0.5, size: rightControls.bonusSize })}
	</Container>
	<Container
		x={rightControls.auto.x}
		y={isPortrait ? controlsRowY : rightControls.auto.y}
		scale={iconScale}
	>
		{@render props.buttonAutoSpin({ anchor: 0.5 })}
	</Container>
	<Container
		x={rightControls.turbo.x}
		y={isPortrait ? controlsRowY : rightControls.turbo.y}
		scale={iconScale}
	>
		{@render props.buttonTurbo({ anchor: 0.5 })}
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

	<MainContainer standard alignHorizontal="left" alignVertical="bottom">
		<Container x={menuOverlayX} y={bar.y - 20}>
			<Container scale={iconScale} y={0}>
				{@render props.buttonGameRules({ anchor: 0.5 })}
			</Container>
			<Container scale={iconScale} y={iconStep}>
				{@render props.buttonMenuClose({ anchor: 0.5 })}
			</Container>
		</Container>
	</MainContainer>
{/if}