/**
 * Board-effect handlers — starpetal flourishes that flash symbols on the board,
 * and (for starfall) rewrite a few cells before re-settling.
 *
 * Singletons only (eventEmitter, stateGameDerived) — no game/utils or
 * bookEventHandlerMap imports, so this stays clear of the features→engine init
 * cycle.
 */
import { eventEmitter } from '$game/eventEmitter';
import { stateGameDerived } from '$game/stateGame.svelte';
import type { Position, RawSymbol } from '$game/types';

/** Flash the symbols at `positions` (win → postWinStatic). Mirrors the engine's
 * private animateSymbols so starpetal handlers can reuse the board's win pop. */
const animateSymbols = async ({ positions }: { positions: Position[] }) => {
	eventEmitter.broadcast({ type: 'boardShow' });
	await eventEmitter.broadcastAsync({ type: 'boardWithAnimateSymbols', symbolPositions: positions });
};

const cloneBoard = (board: RawSymbol[][]): RawSymbol[][] =>
	board.map((reel) => reel.map((symbol) => ({ ...symbol })));

/** Stars fall onto the board, dropping multiplier dewdrops or wild vines into
 * specific cells. Flash the landing spots, then rewrite those cells and settle. */
export const starfall = async (bookEvent: any) => {
	await animateSymbols({ positions: bookEvent.positions });

	const board = cloneBoard(stateGameDerived.boardRaw());
	for (const position of bookEvent.positions as Position[]) {
		board[position.reel][position.row] =
			bookEvent.effect === 'multiplierDewdrop'
				? { name: 'M', multiplier: bookEvent.multiplier ?? 2 }
				: { name: 'W' };
	}
	eventEmitter.broadcast({ type: 'boardSettle', board });
};

/** Petals spread across linked cells — a cosmetic symbol flash. */
export const petalSpread = async (bookEvent: any) => {
	await animateSymbols({ positions: bookEvent.positions });
};

/** Wild vines take hold — a cosmetic symbol flash (the wilds themselves arrive
 * via the board state in the surrounding reveal/tumble events). */
export const stickyWildVines = async (bookEvent: any) => {
	await animateSymbols({ positions: bookEvent.positions });
};
