import { BOARD_SIZES, REEL_PADDING, SYMBOL_SIZE } from './constants';
import { getMaxWinLabelLayout } from './logoConstants';
import { WIN_FRAME_RATIO } from './winFrameLayout';

/** Compact win-frame width for the in-bonus free-spin counter. */
export const FREE_SPIN_COUNTER_FRAME_WIDTH = SYMBOL_SIZE * 1.85;

const LOGO_TOP_Y = 8;

type LayoutType = 'desktop' | 'landscape' | 'tablet' | 'portrait';

/** Left UI strip — logo + feature panel zone. */
const LEFT_COLUMN_RATIO: Record<LayoutType, number> = {
	desktop: 0.28,
	landscape: 0.3,
	tablet: 0.34,
	portrait: 0.42,
};

const FOOTER_ZONE: Record<LayoutType, number> = {
	desktop: 68,
	landscape: 64,
	tablet: 60,
	portrait: 84,
};

const BOTTOM_BAR_HEIGHT: Record<LayoutType, number> = {
	desktop: 104,
	landscape: 100,
	tablet: 104,
	portrait: 156,
};

const BOTTOM_BAR_MARGIN: Record<LayoutType, number> = {
	desktop: 16,
	landscape: 14,
	tablet: 14,
	portrait: 10,
};

/** Shift reels up slightly so GOOD LUCK / WIN fits below the grid. */
const BOARD_Y_RATIO: Record<LayoutType, number> = {
	desktop: 0.44,
	landscape: 0.45,
	tablet: 0.46,
	portrait: 0.405,
};

export const getLeftColumnRatio = (layoutType: LayoutType) => LEFT_COLUMN_RATIO[layoutType];

export const getLeftColumnWidth = (layoutType: LayoutType, mainWidth: number) =>
	mainWidth * LEFT_COLUMN_RATIO[layoutType];

export const getLeftColumnCenterX = (layoutType: LayoutType, mainWidth: number) =>
	getLeftColumnWidth(layoutType, mainWidth) * 0.5;

/** Title logo scale — matches LayoutLeftColumn. */
export const getTitleLogoScale = (layoutType: LayoutType) =>
	layoutType === 'portrait' ? 0.58 : 0.92;

/** Free spin counter — compact panel directly under the Star Petal Forest logo. */
export const getFreeSpinCounterPosition = (
	layoutType: LayoutType,
	mainStandardWidth: number,
) => {
	const titleScale = getTitleLogoScale(layoutType);
	const leftCenterX = getLeftColumnCenterX(layoutType, mainStandardWidth);
	const { logoHeight } = getMaxWinLabelLayout(titleScale);
	const frameWidth = FREE_SPIN_COUNTER_FRAME_WIDTH;
	const frameHeight = frameWidth / WIN_FRAME_RATIO;
	const gapBelowLogo = 10 * titleScale;
	const logoBottom = LOGO_TOP_Y + logoHeight;

	return {
		centerX: leftCenterX,
		centerY: logoBottom + gapBelowLogo + frameHeight * 0.5,
		frameWidth,
		frameHeight,
	};
};

/** Reels centered horizontally; nudged up for the footer ticker. */
export const getBoardLayoutPosition = (layoutType: LayoutType, mainWidth: number, mainHeight: number) => ({
	x: mainWidth * 0.5,
	y: mainHeight * BOARD_Y_RATIO[layoutType],
});

export const getFooterZone = (layoutType: LayoutType) => FOOTER_ZONE[layoutType];

/** Y for spin / bet controls row — matches SDK bottom-bar layouts (LayoutDesktop / LayoutPortrait). */
export const getFooterControlsY = (layoutType: LayoutType, mainHeight: number) => {
	const offsets: Record<LayoutType, number> = {
		desktop: 85,
		landscape: 85,
		tablet: 90,
		portrait: 100,
	};
	return mainHeight - offsets[layoutType];
};

/** Y offset below the board bottom edge for GOOD LUCK / WIN text. */
export const getBoardFooterTickerY = () => BOARD_SIZES.height * 0.5 + 36;

/** Game board vs UI standard widths — keeps spin visually aligned with reel symbols. */
const GAME_MAIN_WIDTH: Record<LayoutType, number> = {
	desktop: 1422,
	landscape: 1600,
	tablet: 1000,
	portrait: 800,
};

const GAME_MAIN_HEIGHT: Record<LayoutType, number> = {
	desktop: 800,
	landscape: 900,
	tablet: 1000,
	portrait: 1422,
};

const STANDARD_MAIN_WIDTH: Record<LayoutType, number> = {
	desktop: 1920,
	landscape: 1920,
	tablet: 1920,
	portrait: 1080,
};

const STANDARD_MAIN_HEIGHT: Record<LayoutType, number> = {
	desktop: 1080,
	landscape: 1080,
	tablet: 1920,
	portrait: 1920,
};

const gameToStandardScale = (layoutType: LayoutType) => ({
	x: STANDARD_MAIN_WIDTH[layoutType] / GAME_MAIN_WIDTH[layoutType],
	y: STANDARD_MAIN_HEIGHT[layoutType] / GAME_MAIN_HEIGHT[layoutType],
});

/** Game + standard layouts share a canvas center but different heights — offset Y when mapping. */
const gameYToStandardY = (layoutType: LayoutType, gameY: number) =>
	gameY + (STANDARD_MAIN_HEIGHT[layoutType] - GAME_MAIN_HEIGHT[layoutType]) / 2;

/** 4th reel column (1-based) — middle of the 7-wide grid. */
const SLOT_CREDIT_BET_REEL_INDEX = 3;

const SLOT_CREDIT_BET_BELOW_BORDER = 44;

/** Board-local anchor: 4th reel column, just under the reel border. */
export const getSlotCreditBetBoardPosition = () => ({
	x: SYMBOL_SIZE * (SLOT_CREDIT_BET_REEL_INDEX + REEL_PADDING),
	y: BOARD_SIZES.height + SLOT_CREDIT_BET_BELOW_BORDER,
});

/** Slightly larger than reel symbols when rendered on screen (~88px game space → ~120 UI standard). */
export const getSpinButtonSize = (layoutType: LayoutType) =>
	Math.round(
		SYMBOL_SIZE *
			(STANDARD_MAIN_WIDTH[layoutType] / GAME_MAIN_WIDTH[layoutType]) *
			(layoutType === 'portrait' ? 0.94 : 1.08),
	);

/** Lotus bonus-buy icon above the spin button. */
export const getBonusBuyButtonSize = (layoutType: LayoutType) =>
	Math.round(getSpinButtonSize(layoutType) * 1.56);

const BONUS_BUY_OFFSET: Record<LayoutType, { x: number; gap: number }> = {
	desktop: { x: 76, gap: 92 },
	landscape: { x: 68, gap: 84 },
	tablet: { x: 78, gap: 88 },
	portrait: { x: 88, gap: 96 },
};

export const getBonusBuyButtonPosition = (
	layoutType: LayoutType,
	spinCluster: { x: number; y: number },
	spinButtonSize: number,
	bonusBuySize: number,
) => {
	const offset = BONUS_BUY_OFFSET[layoutType];

	return {
		x: spinCluster.x + offset.x,
		y: spinCluster.y - spinButtonSize * 0.5 - bonusBuySize * 0.5 - offset.gap,
	};
};

/** Round − / + bet buttons flanking the spin button. */
export const getBetAdjustButtonSize = (layoutType: LayoutType) => {
	const sizes: Record<LayoutType, number> = {
		desktop: 58,
		landscape: 56,
		tablet: 56,
		portrait: 42,
	};
	return Math.max(sizes[layoutType], layoutType === 'portrait' ? 40 : 52);
};

export const getBottomBarHeight = (layoutType: LayoutType) => BOTTOM_BAR_HEIGHT[layoutType];

export const getBottomBarLayout = (layoutType: LayoutType, mainWidth: number, mainHeight: number) => {
	const height = BOTTOM_BAR_HEIGHT[layoutType];
	const margin = BOTTOM_BAR_MARGIN[layoutType];

	return {
		x: mainWidth * 0.5,
		y: mainHeight - margin - height * 0.5,
		width: mainWidth - margin * 2,
		height,
	};
};

export const getBottomBarIconScale = (layoutType: LayoutType) =>
	layoutType === 'portrait' ? 0.42 : 0.44;

export const getBottomBarControlScale = (layoutType: LayoutType) =>
	layoutType === 'portrait' ? 0.58 : 0.56;

export const getBottomBarAmountCellSize = (layoutType: LayoutType) => {
	if (layoutType === 'portrait') return { width: 88, height: 44 };
	if (layoutType === 'tablet') return { width: 104, height: 50 };
	return { width: 112, height: 52 };
};

export const getBottomBarAmountsGap = (layoutType: LayoutType) =>
	layoutType === 'portrait' ? 12 : 10;

/** Horizontal space available for credit / win / bet cells in the bottom bar. */
export const getBottomBarAmountsSlot = (
	layoutType: LayoutType,
	mainWidth: number,
	mainHeight: number,
	iconScale: number,
	betAdjustSize: number,
	spinButtonSize: number,
) => {
	const bar = getBottomBarLayout(layoutType, mainWidth, mainHeight);
	const iconStep = BOTTOM_BAR_ICON_BASE * iconScale + 8;
	const leftInset = layoutType === 'portrait' ? 16 : 28;
	const leftIconsEnd =
		bar.x - bar.width * 0.5 + leftInset + iconStep * 2 + BOTTOM_BAR_ICON_BASE * iconScale * 0.5;
	const betControlGap = spinButtonSize * 0.5 + betAdjustSize * 0.5 + 12;
	const spinClusterLeft =
		getSpinClusterPosition(layoutType, mainWidth, mainHeight).x - betControlGap - betAdjustSize;
	const width = Math.max(0, spinClusterLeft - leftIconsEnd - 16);

	return {
		leftIconsEnd,
		spinClusterLeft,
		width,
		centerX: (leftIconsEnd + spinClusterLeft) * 0.5,
	};
};

/** Approximate rendered width for proxima-nova currency strings. */
export const estimateCurrencyTextWidth = (text: string, fontSize: number) => {
	let width = 0;
	for (const ch of text) {
		if (ch === ',' || ch === '.') width += fontSize * 0.32;
		else if (ch === ' ') width += fontSize * 0.28;
		else if (ch === '$' || ch === '£' || ch === '€') width += fontSize * 0.58;
		else width += fontSize * 0.6;
	}
	return width;
};

/** Grow/shrink amount cells to fit the value while staying within bar limits. */
export const getAmountCellWidth = (
	value: string,
	baseWidth: number,
	cellHeight: number,
	maxWidth: number,
	horizontalPadding = 12,
) => {
	const valueFontSize = Math.round(cellHeight * 0.38);
	const textWidth = estimateCurrencyTextWidth(value, valueFontSize);
	return Math.min(maxWidth, Math.max(baseWidth, Math.ceil(textWidth + horizontalPadding)));
};

/** Board-local X for the 4th reel column (0-based index 3). */
export const getFourthReelColumnBoardX = () =>
	SYMBOL_SIZE * (SLOT_CREDIT_BET_REEL_INDEX + REEL_PADDING);

/**
 * Spin cluster aligned under the 4th bottom-reel symbol.
 * Maps game-space board coords into standard UI bar coords.
 */
export const getSpinClusterPosition = (layoutType: LayoutType, mainWidth: number, mainHeight: number) => {
	const bar = getBottomBarLayout(layoutType, mainWidth, mainHeight);
	const gameMainWidth = GAME_MAIN_WIDTH[layoutType];
	const gameBoardCenterX = gameMainWidth * 0.5;
	const standardBoardCenterX = mainWidth * 0.5;
	const fourthReelGameX =
		gameBoardCenterX - BOARD_SIZES.width * 0.5 + getFourthReelColumnBoardX();

	return {
		x: standardBoardCenterX + (fourthReelGameX - gameBoardCenterX),
		y: bar.y,
	};
};

/** Matches `UI_BASE_SIZE` from components-ui-pixi (footer icon artboard). */
const BOTTOM_BAR_ICON_BASE = 150;

/** Right-side utility buttons — bonus buy, auto, turbo in a spaced horizontal row. */
export const getBottomBarRightControls = (
	layoutType: LayoutType,
	mainWidth: number,
	mainHeight: number,
	iconScale: number,
	bonusBuySize: number,
) => {
	const bar = getBottomBarLayout(layoutType, mainWidth, mainHeight);
	const iconSize = BOTTOM_BAR_ICON_BASE * iconScale;
	const bonusScale = layoutType === 'portrait' ? 0.54 : 0.66;
	const scaledBonusSize = bonusBuySize * bonusScale;
	const gap = layoutType === 'portrait' ? 14 : 22;
	const rightInset = layoutType === 'portrait' ? 16 : 32;
	const rightEdge = bar.x + bar.width * 0.5 - rightInset;

	const turboX = rightEdge - iconSize * 0.5;
	const autoX = turboX - iconSize - gap;
	const bonusX = autoX - iconSize * 0.5 - gap - scaledBonusSize * 0.5;

	return {
		turbo: { x: turboX, y: bar.y },
		auto: { x: autoX, y: bar.y },
		bonus: { x: bonusX, y: bar.y },
		bonusSize: scaledBonusSize,
	};
};

/** Credit/bet cells — centered in the gap between left icons and spin cluster. */
export const getBottomBarAmountsPosition = (
	layoutType: LayoutType,
	mainWidth: number,
	mainHeight: number,
	iconScale: number,
	betAdjustSize: number,
	spinButtonSize: number,
	amountCellCount: 2 | 3 = 2,
) => {
	const bar = getBottomBarLayout(layoutType, mainWidth, mainHeight);
	const gap = getBottomBarAmountsGap(layoutType);
	const slot = getBottomBarAmountsSlot(
		layoutType,
		mainWidth,
		mainHeight,
		iconScale,
		betAdjustSize,
		spinButtonSize,
	);
	const amountCell = getBottomBarAmountCellSize(layoutType);
	const maxCellWidth = Math.min(
		amountCell.width * 2.25,
		(slot.width - gap * (amountCellCount - 1)) / amountCellCount,
	);
	const amountsWidth = maxCellWidth * amountCellCount + gap * (amountCellCount - 1);

	return {
		x: Math.max(
			slot.leftIconsEnd + amountsWidth * 0.5 + 8,
			Math.min(slot.centerX, slot.spinClusterLeft - amountsWidth * 0.5 - 8),
		),
		y: bar.y,
	};
};

/** @deprecated Use getSpinClusterPosition */
export const getSpinClusterX = (layoutType: LayoutType, mainWidth: number) =>
	getSpinClusterPosition(layoutType, mainWidth, STANDARD_MAIN_HEIGHT[layoutType]).x;

/** @deprecated Use getBoardLayoutPosition — kept for any legacy imports */
export const getSidebarWidth = (layoutType: LayoutType) =>
	Math.round(getLeftColumnRatio(layoutType) * 400);

export const getBoardXOffset = () => 0;

const TUMBLE_WIN_PANEL_PEAK_H = 8;
const TUMBLE_WIN_DESKTOP_SCALE = 0.76;
const TUMBLE_WIN_STACKED_SCALE = 0.88;
/** Clearance between plaque bottom and the top reel row (board-local y = 0). */
const TUMBLE_WIN_REEL_GAP = 6;

export const TUMBLE_WIN_FRAME_WIDTH = SYMBOL_SIZE * 1.9;

const tumbleExtentBelowCenter = (frameHeight: number, scale: number) =>
	(frameHeight / 2 + TUMBLE_WIN_PANEL_PEAK_H) * scale;

export const getTumbleWinAmountLayout = () => {
	const frameWidth = TUMBLE_WIN_FRAME_WIDTH;
	const frameHeight = frameWidth / WIN_FRAME_RATIO;
	return { frameWidth, frameHeight };
};

/** Board-local center — entire plaque sits above the reel grid. */
export const getTumbleWinAmountDesktopPosition = () => {
	const { frameHeight } = getTumbleWinAmountLayout();
	const extentBelow = tumbleExtentBelowCenter(frameHeight, TUMBLE_WIN_DESKTOP_SCALE);

	return {
		x: BOARD_SIZES.width * 0.5,
		y: -TUMBLE_WIN_REEL_GAP - extentBelow,
	};
};

/** Stacked layout — panel sits above the board (hidden on mobile; footer shows amount). */
export const getTumbleWinAmountStackedPosition = (gameType: string) => {
	const { frameHeight } = getTumbleWinAmountLayout();
	const extentBelow = tumbleExtentBelowCenter(frameHeight, TUMBLE_WIN_STACKED_SCALE);

	return {
		x: BOARD_SIZES.width * (gameType === 'basegame' ? 0.5 : 0.37),
		y: -TUMBLE_WIN_REEL_GAP - extentBelow,
	};
};

export const getTumbleWinAmountScale = (isStacked: boolean) =>
	isStacked ? TUMBLE_WIN_STACKED_SCALE : TUMBLE_WIN_DESKTOP_SCALE;

/** Tumble panel — bottom aligned with slot grid, half grid height, width matches grid span. */
export const getLeftFeaturePanelLayout = (
	layoutType: LayoutType,
	leftColumnWidth: number,
	isPortrait: boolean,
) => {
	const gameSize = {
		width: GAME_MAIN_WIDTH[layoutType],
		height: GAME_MAIN_HEIGHT[layoutType],
	};
	const { y: boardCenterY } = getBoardLayoutPosition(
		layoutType,
		gameSize.width,
		gameSize.height,
	);
	const scale = gameToStandardScale(layoutType);
	const boardBottomGame = boardCenterY + BOARD_SIZES.height / 2;
	const boardBottomStandard = gameYToStandardY(layoutType, boardBottomGame);
	const panelHeight = Math.max(BOARD_SIZES.height * scale.y * 0.5, 120);
	const panelWidth = Math.max(
		Math.min(BOARD_SIZES.width * scale.x, leftColumnWidth - (isPortrait ? 32 : 40)),
		120,
	);

	return {
		x: leftColumnWidth * 0.5,
		y: boardBottomStandard,
		width: panelWidth,
		height: panelHeight,
		centerY: boardBottomStandard - panelHeight / 2,
	};
};