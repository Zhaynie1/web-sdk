import { stateBet } from 'state-shared';
import type { CascadingReelSpinOptions, SpinType } from 'utils-slots';

import { isAutoSpinActive } from './panelWait';

/** Comfortable manual base-game reel land — full fall-out then fall-in per column. */
export const REEL_PACE_MANUAL: CascadingReelSpinOptions = {
	reelFallInDelay: 28,
	reelFallOutDelay: 62,
	reelPaddingMultiplierNormal: 1,
	reelPaddingMultiplierAnticipated: 12,
	symbolFallInSpeed: 8.5,
	symbolFallInInterval: 30,
	symbolFallInBounceSpeed: 0.48,
	symbolFallInBounceSizeMulti: 0.26,
	symbolFallOutSpeed: 8.5,
	symbolFallOutInterval: 34,
};

/** Autospin without turbo — slightly quicker, still readable. */
export const REEL_PACE_AUTO: CascadingReelSpinOptions = {
	reelFallInDelay: 14,
	reelFallOutDelay: 36,
	reelPaddingMultiplierNormal: 1,
	reelPaddingMultiplierAnticipated: 12,
	symbolFallInSpeed: 12,
	symbolFallInInterval: 14,
	symbolFallInBounceSpeed: 0.55,
	symbolFallInBounceSizeMulti: 0.24,
	symbolFallOutSpeed: 12,
	symbolFallOutInterval: 16,
};

/** Turbo — short and snappy. */
export const REEL_PACE_TURBO: CascadingReelSpinOptions = {
	reelFallInDelay: 0,
	reelFallOutDelay: 12,
	reelPaddingMultiplierNormal: 1,
	reelPaddingMultiplierAnticipated: 10,
	symbolFallInSpeed: 22,
	symbolFallInInterval: 0,
	symbolFallInBounceSpeed: 0.9,
	symbolFallInBounceSizeMulti: 0.2,
	symbolFallOutSpeed: 22,
	symbolFallOutInterval: 0,
};

/** Scatter tease on remaining columns — intentionally slow. */
export const REEL_PACE_SCATTER: CascadingReelSpinOptions = {
	reelFallInDelay: 48,
	reelFallOutDelay: 20,
	reelPaddingMultiplierNormal: 1.1,
	reelPaddingMultiplierAnticipated: 9,
	symbolFallInSpeed: 5,
	symbolFallInInterval: 10,
	symbolFallInBounceSpeed: 0.34,
	symbolFallInBounceSizeMulti: 0.3,
	symbolFallOutSpeed: 7,
	symbolFallOutInterval: 5,
};

export const resolveReelPace = (spinType: SpinType, isBonusGame: boolean): CascadingReelSpinOptions => {
	if (spinType === 'anticipated') return REEL_PACE_SCATTER;
	if (spinType === 'fast') return REEL_PACE_TURBO;
	if (isBonusGame) return REEL_PACE_MANUAL;
	if (stateBet.isTurbo) return REEL_PACE_TURBO;
	if (isAutoSpinActive()) return REEL_PACE_AUTO;
	return REEL_PACE_MANUAL;
};