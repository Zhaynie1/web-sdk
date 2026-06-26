/** Star Petal Forrest title logo aspect (width / height). */
export const LOGO_ASPECT = 715 / 368;

const LOGO_BASE_WIDTH = 480;
const REM = 16;

export type MaxWinLabelLayout = {
	logoWidth: number;
	logoHeight: number;
	/** Y offset from logo top to the max-win text block. */
	maxWinOffsetY: number;
	amountFontSize: number;
	capFontSize: number;
	lineGap: number;
	blockHeight: number;
	amountY: number;
	capY: number;
	/** Logo + gap + max-win block — for vertically centering on the loading screen. */
	totalHeight: number;
};

export const getMaxWinLabelLayout = (scale: number): MaxWinLabelLayout => {
	const logoWidth = LOGO_BASE_WIDTH * scale;
	const logoHeight = logoWidth / LOGO_ASPECT;
	const amountFontSize = REM * 2.15 * scale;
	const capFontSize = REM * 1.2 * scale;
	const lineGap = Math.max(14 * scale, amountFontSize * 0.22);
	const gapBelowLogo = 14 * scale;
	const blockHeight = amountFontSize + lineGap + capFontSize;
	const maxWinOffsetY = logoHeight + gapBelowLogo;
	const amountY = amountFontSize * 0.5;
	const capY = amountFontSize + lineGap + capFontSize * 0.5;

	return {
		logoWidth,
		logoHeight,
		maxWinOffsetY,
		amountFontSize,
		capFontSize,
		lineGap,
		blockHeight,
		amountY,
		capY,
		totalHeight: maxWinOffsetY + blockHeight,
	};
};