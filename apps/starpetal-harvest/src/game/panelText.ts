import { SILVER_BITMAP_FONT_SIZE } from './winFrameLayout';

/** Internal Text resolution for crisp win / free-spin labels at 1080p+. */
export const PANEL_TEXT_RESOLUTION = 2;

/** Home-screen max-win label — 4× internal resolution for crisp 4K output. */
export const MAX_WIN_TEXT_RESOLUTION = 4;

export const silverBitmapScale = (targetFontSize: number) =>
	Math.min(targetFontSize / SILVER_BITMAP_FONT_SIZE, 1);

export const silverBitmapStyle = () => ({
	fontFamily: 'silver' as const,
	fontSize: SILVER_BITMAP_FONT_SIZE,
	align: 'center' as const,
});