import { waitForResolve, waitForTimeout } from 'utils-shared/wait';

/** Blocks accidental click-through from the spin / buy button onto the press overlay. */
const PRESS_ARM_DELAY_MS = 500;

export function createRequiredPressGate(pressDelayMs = PRESS_ARM_DELAY_MS) {
	let resolvePress: (() => void) | null = null;
	let pressEnabled = false;
	let armTimer: ReturnType<typeof setTimeout> | null = null;

	const disarm = () => {
		pressEnabled = false;
		if (armTimer) {
			clearTimeout(armTimer);
			armTimer = null;
		}
	};

	const arm = () => {
		disarm();
		armTimer = setTimeout(() => {
			pressEnabled = true;
			armTimer = null;
		}, pressDelayMs);
	};

	const waitForPress = (timeoutMs = 20_000) =>
		Promise.race([
			waitForResolve((resolve) => {
				resolvePress = resolve;
			}),
			waitForTimeout(timeoutMs).then(() => {
				console.warn('[starpetal-harvest] Press gate timed out');
				resolvePress = null;
				disarm();
			}),
		]);

	const tryConfirm = () => {
		if (!pressEnabled || !resolvePress) return;
		const resolve = resolvePress;
		resolvePress = null;
		disarm();
		resolve();
	};

	const cancel = () => {
		resolvePress = null;
		disarm();
	};

	return {
		arm,
		disarm,
		waitForPress,
		tryConfirm,
		cancel,
		get pressEnabled() {
			return pressEnabled;
		},
	};
}

export const freeSpinIntroPressGate = createRequiredPressGate();
export const freeSpinOutroPressGate = createRequiredPressGate();