import { waitForTimeout } from 'utils-shared/wait';
import { stateSlots } from 'utils-slots';

import {
	getBetRoundActiveSince,
	isLocalSpinInFlight,
	markBetRoundEnded,
	setBetRoundBusy,
	setLocalSpinInFlight,
	stateBetRoundBusy,
} from './betRoundBusy.svelte';
import { eventEmitter } from './eventEmitter';
import { stateGame, stateGameDerived } from './stateGame.svelte';

export const BOOK_ROUND_TIMEOUT_MS = 45_000;
export const BET_ROUND_HARD_ABORT_MS = 55_000;
/** Only full-reset when reels are mid-animation — never touch a clean stopped board. */
export function prepareBoardForSpin(fallbackBoard?: typeof stateGame.logicalBoard) {
	stateSlots.isPreSpinning = false;

	const allStopped = stateGame.board.every((reel) => reel.reelState.motion === 'stopped');
	if (allStopped) return;

	const board = fallbackBoard ?? stateGame.logicalBoard ?? stateGameDerived.boardRaw();
	if (board?.length) stateGameDerived.enhancedBoard.settle(board);
	else stateGameDerived.enhancedBoard.settle();
}

export async function withSpinTimeout<T>(
	promise: Promise<T>,
	timeoutMs: number,
	label: string,
	onTimeout?: () => void,
): Promise<T> {
	let timedOut = false;

	const result = await Promise.race([
		promise,
		waitForTimeout(timeoutMs).then(() => {
			timedOut = true;
			console.warn(`[starpetal-harvest] Timed out: ${label} (${timeoutMs}ms)`);
			onTimeout?.();
			return undefined as T;
		}),
	]);

	if (timedOut) throw new Error(`Spin timeout: ${label}`);
	return result;
}

export function recoverFrozenReels() {
	prepareBoardForSpin();
}

export function forceReleaseSpinRound() {
	setBetRoundBusy(false);
	setLocalSpinInFlight(false);
	markBetRoundEnded();
	stateSlots.isPreSpinning = false;
	eventEmitter.broadcast({ type: 'stopButtonEnable' });
}

export function abortFrozenSpin(label: string) {
	console.warn(`[starpetal-harvest] Aborting frozen spin: ${label}`);
	prepareBoardForSpin();
	forceReleaseSpinRound();
}

/** Only unlock the button on a truly stuck round — never snap reels mid-animation. */
export const tickBetRoundWatchdog = () => {
	if (!stateBetRoundBusy.active && !isLocalSpinInFlight()) return;

	const activeSince = getBetRoundActiveSince();
	if (activeSince <= 0) return;
	if (Date.now() - activeSince < BET_ROUND_HARD_ABORT_MS) return;

	abortFrozenSpin('bet-round-watchdog');
};