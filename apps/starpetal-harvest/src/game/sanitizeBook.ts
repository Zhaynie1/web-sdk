import type { BookEvent, BookEventOfType } from './typesBookEvent';
import type { Position, RawSymbol } from './types';
import { isScatterSymbol } from './scatterAnticipation';
import { PAYING_SYMBOLS } from './constants';
import { MIN_CLUSTER_SIZE } from './payTableData';
import {
	clusterWinToBookMeta,
	findPayingClusters,
	type BoardClusterWin,
} from './evaluateBoardClusters';

let replacementCursor = 0;

const nextReplacementSymbol = (): RawSymbol => {
	const name = PAYING_SYMBOLS[replacementCursor % PAYING_SYMBOLS.length];
	replacementCursor += 1;
	return { name };
};

export const sanitizeRawSymbol = (rawSymbol: RawSymbol): RawSymbol => rawSymbol;

export const cloneBoard = (board: RawSymbol[][]) =>
	board.map((reel) => reel.map((symbol) => ({ ...symbol })));

const sanitizeBoard = (board: RawSymbol[][]) =>
	board.map((reel) => reel.map((symbol) => sanitizeRawSymbol(symbol)));

const sanitizeNewSymbols = (newSymbols: RawSymbol[][]) =>
	newSymbols.map((reel) => reel.map((symbol) => sanitizeRawSymbol(symbol)));

const positionKey = (reel: number, row: number) => `${reel},${row}`;

export const buildTumbledBoard = (
	board: RawSymbol[][],
	explodingSymbols: { reel: number; row: number }[],
	newSymbols: RawSymbol[][],
) => {
	const explodeSet = new Set(explodingSymbols.map((pos) => positionKey(pos.reel, pos.row)));
	const incomingCountByReel = new Map<number, number>();

	for (const position of explodingSymbols) {
		incomingCountByReel.set(
			position.reel,
			(incomingCountByReel.get(position.reel) ?? 0) + 1,
		);
	}

	return board.map((reel, reelIndex) => {
		const remaining = reel.filter((_, row) => !explodeSet.has(positionKey(reelIndex, row)));
		const expectedIncoming = incomingCountByReel.get(reelIndex) ?? 0;
		const incoming = (newSymbols[reelIndex] ?? []).map((symbol) => sanitizeRawSymbol(symbol));

		while (incoming.length < expectedIncoming) {
			const fallback = remaining[0] ?? reel.find((symbol) => symbol !== undefined) ?? { name: 'L1' };
			incoming.push(sanitizeRawSymbol({ ...fallback }));
		}
		if (incoming.length > expectedIncoming) {
			incoming.length = expectedIncoming;
		}

		const tumbled = [...incoming, ...remaining];
		while (tumbled.length < reel.length) {
			tumbled.push(sanitizeRawSymbol({ name: 'L1' }));
		}

		return tumbled.slice(0, reel.length);
	});
};

const applyTumbleToBoard = buildTumbledBoard;

const positionsMatch = (a: { reel: number; row: number }[], b: { reel: number; row: number }[]) => {
	if (a.length !== b.length) return false;
	const keys = new Set(a.map((pos) => positionKey(pos.reel, pos.row)));
	return b.every((pos) => keys.has(positionKey(pos.reel, pos.row)));
};

const filterScatterTriggerPositions = (
	board: RawSymbol[][] | null,
	positions: Position[] | undefined,
) => {
	if (!board || !positions?.length) return positions ?? [];
	return positions.filter((pos) => isScatterSymbol(board[pos.reel]?.[pos.row]));
};

const positionsOverlap = (a: Position[], b: Position[]) => {
	const keys = new Set(b.map((pos) => positionKey(pos.reel, pos.row)));
	return a.filter((pos) => keys.has(positionKey(pos.reel, pos.row))).length;
};

const mergeBookMeta = (
	cluster: BoardClusterWin,
	bookWins: BookEventOfType<'winInfo'>['wins'],
) => {
	const normalized = clusterWinToBookMeta(cluster);
	const source = bookWins.find(
		(win) => win.symbol === cluster.symbol && positionsMatch(win.positions, cluster.positions),
	);

	if (!source) return normalized;

	return {
		...normalized,
		win: source.meta.winWithoutMult * source.meta.globalMult * source.meta.clusterMult,
		meta: {
			...normalized.meta,
			globalMult: source.meta.globalMult ?? 1,
			clusterMult: source.meta.clusterMult ?? 1,
			winWithoutMult: source.meta.winWithoutMult ?? normalized.meta.winWithoutMult,
			overlay: source.meta.overlay ?? normalized.meta.overlay,
		},
	};
};

export const sanitizeBookEvents = (bookEvents: BookEvent[]): BookEvent[] => {
	replacementCursor = 0;
	let boardForClusters: RawSymbol[][] | null = null;
	let lastWinPositions: { reel: number; row: number }[] = [];

	return bookEvents.flatMap((bookEvent) => {
			if (
				bookEvent.type === 'freeSpinRetrigger' &&
				(bookEvent.positions?.length ?? 0) < 3
			) {
				return [];
			}

			if (bookEvent.type === 'reveal') {
				boardForClusters = cloneBoard(bookEvent.board);
				return [{ ...bookEvent, board: sanitizeBoard(bookEvent.board) }];
			}

			if (bookEvent.type === 'tumbleBoard') {
				const explodingSymbols =
					lastWinPositions.length > 0 ? lastWinPositions : bookEvent.explodingSymbols;

				if (boardForClusters) {
					boardForClusters = applyTumbleToBoard(
						boardForClusters,
						explodingSymbols,
						bookEvent.newSymbols,
					);
				}
				lastWinPositions = [];
				return [
					{
						...bookEvent,
						explodingSymbols,
						newSymbols: sanitizeNewSymbols(bookEvent.newSymbols),
					},
				];
			}

			if (bookEvent.type === 'winInfo') {
				const payingClusters = boardForClusters ? findPayingClusters(boardForClusters) : [];
				const boardWins =
					payingClusters.length > 0
						? payingClusters.map((cluster) => mergeBookMeta(cluster, bookEvent.wins))
						: [];
				const unmatchedBookWins = bookEvent.wins.filter((win) => {
					if (win.positions.length < MIN_CLUSTER_SIZE) return false;

					return !boardWins.some(
						(boardWin) =>
							boardWin.symbol === win.symbol &&
							positionsOverlap(boardWin.positions, win.positions) >= MIN_CLUSTER_SIZE,
					);
				});
				const wins = [...boardWins, ...unmatchedBookWins];
				const totalWin = wins.reduce((sum, win) => sum + win.win, 0);
				lastWinPositions = wins.flatMap((win) => win.positions);

				return [
					{
						...bookEvent,
						totalWin,
						wins,
					},
				];
			}

			if (bookEvent.type === 'freeSpinTrigger' || bookEvent.type === 'freeSpinRetrigger') {
				const positions = filterScatterTriggerPositions(boardForClusters, bookEvent.positions);
				if (positions.length === bookEvent.positions.length) return [bookEvent];
				return [{ ...bookEvent, positions }];
			}

			return [bookEvent];
		});
};