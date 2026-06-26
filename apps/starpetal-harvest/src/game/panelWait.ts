import { stateBet } from 'state-shared';
import { waitForResolve, waitForTimeout } from 'utils-shared/wait';

type XstateDerived = { isAutoBetting: () => boolean };

/** Autospin / space-hold — uses counter, not xstate (more reliable during playGame). */
export const isAutoSpinActive = () =>
	stateBet.autoSpinsCounter > 0 || stateBet.isSpaceHold;

export const shouldAutoAdvancePanels = (_stateXstateDerived?: XstateDerived) =>
	isAutoSpinActive() || stateBet.isTurbo;

/** Fast reel spin type — turbo only (autospin without turbo uses normal reel pacing). */
export const shouldUseFastSpin = () => {
	if (stateBet.forceNormalSpinPacing) return false;
	return stateBet.isTurbo;
};

/** Skip heavy tumble/cluster/multiplier animations — turbo only (autospin plays full wins). */
export const shouldFastPathAnimations = (_stateXstateDerived?: XstateDerived) => {
	if (stateBet.forceNormalSpinPacing) return false;
	return stateBet.isTurbo;
};

/** Press-to-continue with turbo/auto-skip and a hard timeout so the book never hangs. */
export async function waitForPressOrAutoAdvance(
	setOncomplete: (fn: () => void) => void,
	_stateXstateDerived?: XstateDerived,
	options?: { autoAdvanceMs?: number; timeoutMs?: number; requirePress?: boolean },
) {
	const autoAdvanceMs = options?.autoAdvanceMs ?? 1400;
	const timeoutMs = options?.timeoutMs ?? 20000;
	const requirePress = options?.requirePress ?? false;

	if (!requirePress && shouldAutoAdvancePanels()) {
		await waitForTimeout(autoAdvanceMs);
		return;
	}

	await Promise.race([waitForResolve(setOncomplete), waitForTimeout(timeoutMs)]);
}

/** Fade tween completion with timeout fallback. */
export async function waitForFadeComplete(
	setOncomplete: (fn: () => void) => void,
	timeoutMs = 500,
) {
	await Promise.race([waitForResolve(setOncomplete), waitForTimeout(timeoutMs)]);
}