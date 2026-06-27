import { waitForResolve, waitForTimeout } from 'utils-shared/wait';
import type { Reel, GetRawSymbolFromReel } from 'utils-slots';
import { stateSlots } from 'utils-slots';

import { shouldUseFastSpin } from './panelWait';
import { countScattersOnReel } from './scatterAnticipation';

/**
 * Safety cap on the pre-spin "ready to spin" gate. A reel signals readiness when
 * it reaches the `hanging` state, but if it gets aborted/settled mid-prep it may
 * never re-enter `hanging`, leaving its resolver uncalled. Without this cap the
 * whole round would hang until the 45s book-round timeout. 2s is far longer than
 * a real fall-out, so it only ever fires on a genuinely stuck reel.
 */
const READY_TO_SPIN_TIMEOUT_MS = 2_000;

type ScatterHooks = {
	resetScatterAnticipationHold: (length: number) => void;
	retainScatterAnticipationTrail: (reelIndex: number) => void;
};

type RevealEvent<TRawSymbol> = {
	board: TRawSymbol[][];
	anticipation: number[];
	paddingPositions?: number[];
};

export function createBoardSpin<TReel extends Reel<any, any>>({
	board,
	hooks,
}: {
	board: TReel[];
	hooks?: ScatterHooks;
}) {
	type TRawSymbol = GetRawSymbolFromReel<TReel>;

	async function spin({
		revealEvent,
		paddingBoard,
	}: {
		revealEvent: RevealEvent<TRawSymbol>;
		paddingBoard?: TRawSymbol[][];
	}) {
		const hasAnticipation = revealEvent.anticipation.some((tier) => tier > 0);
		const firstAnticipatedReel = revealEvent.anticipation.findIndex((tier) => tier > 0);
		const globalSpinType = shouldUseFastSpin() ? 'fast' : 'normal';

		const resolveSpinType = (reelIndex: number) => {
			const isAnticipated = (revealEvent.anticipation[reelIndex] ?? 0) > 0;
			if (isAnticipated) return 'anticipated' as const;
			const noStop = hasAnticipation && reelIndex >= firstAnticipatedReel;
			if (noStop) return 'normal' as const;
			return globalSpinType;
		};

		if (stateSlots.isPreSpinning) {
			await Promise.all(
				board.map((reel) =>
					Promise.race([
						waitForResolve((resolve) => {
							reel.reelState.readyToSpin = resolve;
							if (reel.reelState.motion === 'hanging') resolve();
						}),
						waitForTimeout(READY_TO_SPIN_TIMEOUT_MS),
					]),
				),
			);
		}

		stateSlots.isPreSpinning = false;

		hooks?.resetScatterAnticipationHold(board.length);
		board.forEach((reel) => {
			reel.reelState.anticipating = false;
		});

		board.reduce((previousPaddingSize, reel, reelIndex) => {
			const spinType = resolveSpinType(reelIndex);
			const symbols = revealEvent.board[reelIndex] as TRawSymbol[];

			return reel.prepareToSpin({
				noStop: hasAnticipation && reelIndex >= firstAnticipatedReel,
				spinType,
				symbols,
				// @ts-ignore optional padding on cascading reel
				paddingReel: paddingBoard?.[reelIndex],
				// @ts-ignore optional padding on cascading reel
				paddingPosition: revealEvent.paddingPositions?.[reelIndex],
				previousPaddingSize,
				onSpinFinishing: () => {
					reel.onReelStopping();

					const wasTeasing = reel.reelState.anticipating;
					if (wasTeasing && countScattersOnReel(symbols) > 0) {
						hooks?.retainScatterAnticipationTrail(reelIndex);
					}
					reel.reelState.anticipating = false;

					const nextReel = reelIndex + 1;
					if ((revealEvent.anticipation[nextReel] ?? 0) > 0) {
						board[nextReel].reelState.anticipating = true;
					}
				},
			});
		}, 0);

		await Promise.all(board.map((reel) => reel.spin()));

		hooks?.resetScatterAnticipationHold(board.length);
		board.forEach((reel) => {
			reel.reelState.anticipating = false;
		});
	}

	return { spin };
}