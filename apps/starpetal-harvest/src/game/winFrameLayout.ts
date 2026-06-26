export const WIN_FRAME_RATIO = 1248 / 832;
/** Silver bitmap font native size — scale glyphs from this baseline. */
export const SILVER_BITMAP_FONT_SIZE = 97;

export type WinFrameLayout = 'default' | 'compact' | 'intro';

export const getWinFrameMetrics = (frameWidth: number, layout: WinFrameLayout = 'default') => {
	const frameHeight = frameWidth / WIN_FRAME_RATIO;

	const titleScale = layout === 'compact' ? 0.088 : layout === 'intro' ? 0.095 : 0.12;
	const subtitleScale = layout === 'compact' ? 0.042 : layout === 'intro' ? 0.055 : 0.052;
	const amountScale = layout === 'compact' ? 0.15 : layout === 'intro' ? 0.12 : 0.1;
	const labelScale = layout === 'compact' ? 0.11 : layout === 'intro' ? 0.085 : 0.05;

	return {
		frameWidth,
		frameHeight,
		titleFontSize: frameHeight * titleScale,
		subtitleFontSize: frameHeight * subtitleScale,
		amountFontSize: frameHeight * amountScale,
		labelFontSize: frameHeight * labelScale,
		amountMaxWidth: frameWidth * (layout === 'compact' ? 0.78 : 0.52),
	};
};

export type IntroPanelLayout = {
	titleY: number;
	subtitleY: number;
	spinCountY: number;
	freeSpinsLabelY: number;
};

/** ~1/16 inch at 96 DPI — nudge spin count above the FREE SPINS label. */
export const INTRO_SPIN_COUNT_LIFT = 6;

/** Vertically stacks intro copy with gaps derived from font metrics. */
export const getIntroPanelLayout = (
	metrics: ReturnType<typeof getWinFrameMetrics>,
): IntroPanelLayout => {
	const { frameHeight, titleFontSize, subtitleFontSize, amountFontSize, labelFontSize } = metrics;
	const rowGap = frameHeight * 0.035;

	const titleY = -frameHeight * 0.3;
	const subtitleY = titleY + titleFontSize * 0.5 + rowGap + subtitleFontSize * 0.5;
	const spinCountBaseY =
		subtitleY + subtitleFontSize * 0.5 + rowGap * 1.5 + amountFontSize * 0.5;
	const spinCountY = spinCountBaseY - INTRO_SPIN_COUNT_LIFT;
	const freeSpinsLabelY =
		spinCountBaseY + amountFontSize * 0.5 + rowGap + labelFontSize * 0.5;

	return { titleY, subtitleY, spinCountY, freeSpinsLabelY };
};

/** Two-line stack centered inside the compact free-spin counter panel. */
export const getFreeSpinCounterPanelLayout = (
	metrics: ReturnType<typeof getWinFrameMetrics>,
	countFontSize = metrics.amountFontSize,
) => {
	const contentOffsetY = metrics.frameHeight * 0.02;
	const rowGap = metrics.frameHeight * 0.055;
	const labelNudge = metrics.frameHeight * 0.022;
	const labelHeight = metrics.labelFontSize;
	const countHeight = countFontSize;
	const blockHeight = labelHeight + rowGap + countHeight;
	const blockTop = contentOffsetY - blockHeight * 0.5;

	return {
		labelY: blockTop + labelHeight * 0.5 - labelNudge,
		countY: blockTop + labelHeight + rowGap + countHeight * 0.5,
	};
};