/**
 * boardMultiplierInfo — starpetal's on-board multiplier collection.
 *
 * After a tumble, dewdrop (M) symbols on the board light up, fly to the board
 * centre, and combine into a single total multiplier that explodes over the
 * win. Pure orchestration: it broadcasts emitter events the multiplier
 * components (MultiplierBoard/MultiplierTotal) and the engine's TumbleWinAmount
 * react to. The board itself is left as the reveal/tumble left it.
 *
 * Singletons only (eventEmitter, stateBet) — no game/utils or bookEventHandlerMap
 * imports, so this stays clear of the features→engine init cycle.
 */
import { stateBet } from 'state-shared';

import { eventEmitter } from '$game/eventEmitter';

/** Run `promise`, but never let a stuck animation hang the book; on timeout,
 * clean up the multiplier visuals and move on. */
const withTimeout = async (
	promise: Promise<unknown>,
	ms: number,
	onTimeout: () => void,
): Promise<void> => {
	let timer: ReturnType<typeof setTimeout>;
	const timeout = new Promise<void>((resolve) => {
		timer = setTimeout(() => {
			onTimeout();
			resolve();
		}, ms);
	});
	await Promise.race([Promise.resolve(promise).then(() => clearTimeout(timer)), timeout]);
};

export const boardMultiplierInfo = async (bookEvent: any) => {
	const runMultiplierCollect = async () => {
		eventEmitter.broadcast({ type: 'tumbleWinAmountShow' });
		eventEmitter.broadcast({ type: 'tumbleWinAmountReset' });
		eventEmitter.broadcast({
			type: 'tumbleWinAmountUpdate',
			amount: bookEvent.winInfo.tumbleWin,
			animate: false,
		});

		// Turbo: skip the collection choreography, just register the win amount.
		if (stateBet.isTurbo) {
			eventEmitter.broadcast({ type: 'tumbleWinAmountHide' });
			return;
		}

		eventEmitter.broadcast({ type: 'multiplierBoardShow' });
		eventEmitter.broadcast({
			type: 'multiplierBoardInit',
			positions: bookEvent.multInfo.positions,
		});
		await eventEmitter.broadcastAsync({ type: 'multiplierBoardAnimate' });
		await eventEmitter.broadcastAsync({ type: 'multiplierBoardMove' });
		eventEmitter.broadcast({ type: 'multiplierBoardReset' });
		eventEmitter.broadcast({ type: 'multiplierBoardHide' });
		eventEmitter.broadcast({ type: 'multiplierTotalShow' });
		eventEmitter.broadcast({
			type: 'multiplierTotalUpdate',
			totalMultiplier: bookEvent.winInfo.boardMult,
		});
		await eventEmitter.broadcastAsync({ type: 'multiplierTotalAnimate' });
		eventEmitter.broadcast({ type: 'multiplierTotalHide' });
		eventEmitter.broadcast({ type: 'tumbleWinAmountHide' });
	};

	await withTimeout(runMultiplierCollect(), 2_500, () => {
		eventEmitter.broadcast({ type: 'multiplierBoardReset' });
		eventEmitter.broadcast({ type: 'multiplierBoardHide' });
		eventEmitter.broadcast({ type: 'multiplierTotalHide' });
		eventEmitter.broadcast({ type: 'tumbleWinAmountHide' });
	});
};
