import { backOut } from 'svelte/easing';

import { waitForTimeout } from 'utils-shared/wait';

import type { Reel } from './stateGame.svelte';
import type { Position, RawSymbol } from './types';
import { stateLayoutDerived } from './stateLayout';
import { stateGame } from './stateGame.svelte';
import { getSymbolY } from './utils';

const TUMBLE_TWEEN_TIMEOUT_MS = 2_500;

const tweenWithTimeout = (
	tween: { set: (value: number, options?: object) => Promise<void> },
	value: number,
	options?: object,
) =>
	Promise.race([
		tween.set(value, options),
		waitForTimeout(TUMBLE_TWEEN_TIMEOUT_MS),
	]);

const DESKTOP_TUMBLE = { stagger: 8, incoming: 72, survivor: 58 };
const MOBILE_TUMBLE = { stagger: 5, incoming: 52, survivor: 44 };

const getTumbleTimings = () => {
	if (!stateLayoutDerived.isStacked()) return DESKTOP_TUMBLE;
	const isBonus =
		stateGame.gameType === 'freeSpins' || stateGame.gameType === 'freegame';
	return isBonus ? DESKTOP_TUMBLE : MOBILE_TUMBLE;
};

const groupExplodePositionsByReel = (positions: Position[]) => {
	const byReel = new Map<number, Set<number>>();

	for (const position of positions) {
		const rows = byReel.get(position.reel) ?? new Set<number>();
		rows.add(position.row);
		byReel.set(position.reel, rows);
	}

	return byReel;
};

export async function animateBoardTumble({
	board,
	explodePositions,
	settledBoard,
}: {
	board: Reel[];
	explodePositions: Position[];
	settledBoard: RawSymbol[][];
}) {
	const explodeByReel = groupExplodePositionsByReel(explodePositions);

	const { stagger: incomingStaggerMs, incoming: incomingFallMs, survivor: survivorFallMs } =
		getTumbleTimings();

	board.forEach((reel) => {
		reel.stop();
		reel.reelState.motion = 'stopped';
	});

	await Promise.all(
		board.map(async (reel, reelIndex) => {
			const explodeRows = explodeByReel.get(reelIndex);
			if (!explodeRows || explodeRows.size === 0) return;

			const targetReel = settledBoard[reelIndex];
			const symbols = reel.reelState.symbols;
			const explodedRowsSorted = [...explodeRows].sort((a, b) => a - b);
			const incomingCount = explodedRowsSorted.length;

			const survivingOldRows: number[] = [];
			for (let row = 0; row < symbols.length; row++) {
				if (!explodeRows.has(row)) survivingOldRows.push(row);
			}

			const animations: Promise<unknown>[] = [];

			for (let i = 0; i < incomingCount; i++) {
				const targetRow = i;
				const sourceRow = explodedRowsSorted[i];
				const reelSymbol = symbols[sourceRow];
				if (!reelSymbol) continue;

				reelSymbol.rawSymbol = targetReel[targetRow];
				reelSymbol.symbolState = 'static';

				const startY = getSymbolY(-1.5 - (incomingCount - i));
				const endY = getSymbolY(targetRow - 1);

				animations.push(
					(async () => {
						await tweenWithTimeout(reelSymbol.symbolY, startY, { duration: 0 });
						await tweenWithTimeout(reelSymbol.symbolY, endY, {
							duration: incomingFallMs,
							easing: backOut,
							delay: i * incomingStaggerMs,
						});
					})(),
				);
			}

			for (let survivorIndex = 0; survivorIndex < survivingOldRows.length; survivorIndex++) {
				const oldRow = survivingOldRows[survivorIndex];
				const targetRow = incomingCount + survivorIndex;
				const reelSymbol = symbols[oldRow];
				if (!reelSymbol) continue;

				reelSymbol.rawSymbol = targetReel[targetRow];
				reelSymbol.symbolState = 'static';

				const endY = getSymbolY(targetRow - 1);
				if (Math.abs(reelSymbol.symbolY.current - endY) > 0.5) {
					animations.push(
						tweenWithTimeout(reelSymbol.symbolY, endY, {
							duration: survivorFallMs,
							easing: backOut,
						}),
					);
				}
			}

			await Promise.all(animations);
		}),
	);

	board.forEach((reel, reelIndex) => {
		const targetReel = settledBoard[reelIndex] ?? [];
		reel.reelState.symbols.forEach((reelSymbol, symbolIndex) => {
			const nextSymbol = targetReel[symbolIndex] ?? reelSymbol.rawSymbol;
			reelSymbol.rawSymbol = nextSymbol;
			reelSymbol.symbolState = 'static';
			void reelSymbol.symbolY.set(getSymbolY(symbolIndex - 1), { duration: 0 });
		});
	});
}