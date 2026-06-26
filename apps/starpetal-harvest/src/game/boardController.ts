import { stateBet } from 'state-shared';
import type { Reel, GetRawSymbolFromReel } from 'utils-slots';
import { stateSlots } from 'utils-slots';

import { createBoardSpin } from './boardSpin';
import { getSymbolY } from './utils';

type ScatterHooks = {
	resetScatterAnticipationHold: (length: number) => void;
	retainScatterAnticipationTrail: (reelIndex: number) => void;
};

export function createBoardController(hooks?: ScatterHooks) {
	function enhanceBoard<TReel extends Reel<any, any>>({ board }: { board: TReel[] }) {
		type TRawSymbol = GetRawSymbolFromReel<TReel>;

		const { spin } = createBoardSpin({ board, hooks });

		const settle = (rawBoard?: TRawSymbol[][]) => {
			board.forEach((reel, reelIndex) => {
				const wasAnimating = reel.reelState.motion !== 'stopped';
				if (wasAnimating) reel.stop();

				const rawSymbols = rawBoard?.[reelIndex];
				if (rawSymbols?.length) {
					reel.setSymbolsWithRawSymbols(rawSymbols);
				} else {
					reel.reelState.motion = 'stopped';
				}

				if (!wasAnimating) return;

				reel.reelState.symbols.forEach((reelSymbol, symbolIndex) => {
					if (rawSymbols?.[symbolIndex]) {
						reelSymbol.rawSymbol = rawSymbols[symbolIndex];
					}
					void reelSymbol.symbolY.set(getSymbolY(symbolIndex - 1), { duration: 0 });
					reelSymbol.symbolState = 'static';
				});
			});
		};

		const stop = () => board.forEach((reel) => reel.stop());

		const syncSymbolPositions = () => {
			board.forEach((reel) => {
				reel.reelState.motion = 'stopped';
				reel.reelState.anticipating = false;
				reel.reelState.symbols.forEach((reelSymbol, symbolIndex) => {
					void reelSymbol.symbolY.set(getSymbolY(symbolIndex - 1), { duration: 0 });
				});
			});
		};

		const readyToSpinEffect = () => board.forEach((reel) => reel.readyToSpinEffect());

		const preSpin = async ({
			paddingBoard,
		}: {
			paddingBoard?: TRawSymbol[][];
		} = {}) => {
			stateSlots.isPreSpinning = true;
			const isTurboBeforeAll = stateBet.isTurbo;

			await Promise.all(
				board.map((reel, reelIndex) =>
					reel.preSpin({
						isTurboBeforeAll,
						// @ts-ignore optional padding reel on cascading reel
						preSpinPaddingReel: paddingBoard?.[reelIndex],
					}),
				),
			);
		};

		return {
			board,
			preSpin,
			spin,
			settle,
			syncSymbolPositions,
			stop,
			readyToSpinEffect,
		};
	}

	return { enhanceBoard };
}