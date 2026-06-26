import { getClusterPayMultiplier, MIN_CLUSTER_SIZE } from './payTableData';
import { getClusterCenter, getValidClusters } from './clusterUtils';
import type { Position, RawSymbol } from './types';
import type { BookEventOfType } from './typesBookEvent';

/** Playable rows on the padded reel (excludes off-screen padding at 0 and 8). */
export const VISIBLE_ROW_START = 1;
export const VISIBLE_ROW_END = 7;

export const PAYING_SYMBOLS = ['H1', 'H2', 'H3', 'H4', 'L1', 'L2', 'L3'] as const;
export const WILD_SYMBOL = 'W';
export const MULTIPLIER_SYMBOL = 'M';

export type PayingSymbol = (typeof PAYING_SYMBOLS)[number];

export type BoardClusterWin = {
	symbol: PayingSymbol;
	positions: Position[];
	clusterSize: number;
	payMultiplier: number;
};

const positionKey = (position: Position) => `${position.reel},${position.row}`;

export const isVisibleBoardPosition = (position: Position) =>
	position.row >= VISIBLE_ROW_START && position.row <= VISIBLE_ROW_END;

export const positionMatchesWinSymbol = (
	board: RawSymbol[][],
	position: Position,
	symbol: string,
) => {
	const cell = board[position.reel]?.[position.row];
	return cell !== undefined && (cell.name === symbol || cell.name === WILD_SYMBOL);
};

const isPayingSymbol = (name: string): name is PayingSymbol =>
	(PAYING_SYMBOLS as readonly string[]).includes(name);

const cellMatchesCluster = (cell: RawSymbol | undefined, symbol: PayingSymbol) =>
	cell !== undefined && (cell.name === symbol || cell.name === WILD_SYMBOL);

const isMultiplierCell = (cell: RawSymbol | undefined) => cell?.name === MULTIPLIER_SYMBOL;

/** Dewdrops occupy a cell but do not break same-symbol cluster connectivity. */
const canTraverseForCluster = (cell: RawSymbol | undefined, symbol: PayingSymbol) =>
	cell !== undefined && (cellMatchesCluster(cell, symbol) || isMultiplierCell(cell));

const floodCluster = (
	board: RawSymbol[][],
	start: Position,
	symbol: PayingSymbol,
	claimed: Set<string>,
): Position[] => {
	const cluster: Position[] = [];
	const queue: Position[] = [start];
	const localSeen = new Set<string>();

	while (queue.length > 0) {
		const current = queue.shift()!;
		const key = positionKey(current);
		if (localSeen.has(key) || claimed.has(key)) continue;
		if (!isVisibleBoardPosition(current)) continue;

		const cell = board[current.reel]?.[current.row];
		if (!canTraverseForCluster(cell, symbol)) continue;

		localSeen.add(key);
		if (cellMatchesCluster(cell, symbol)) {
			cluster.push(current);
		}

		for (const [deltaReel, deltaRow] of [
			[0, 1],
			[0, -1],
			[1, 0],
			[-1, 0],
		] as const) {
			queue.push({
				reel: current.reel + deltaReel,
				row: current.row + deltaRow,
			});
		}
	}

	if (cluster.length < MIN_CLUSTER_SIZE) return [];

	for (const position of cluster) {
		claimed.add(positionKey(position));
	}

	return cluster;
};

/** Orthogonal clusters of 5+ matching symbols (wilds substitute for the paying symbol). */
export const findPayingClusters = (board: RawSymbol[][]): BoardClusterWin[] => {
	const claimed = new Set<string>();
	const wins: BoardClusterWin[] = [];

	for (let reel = 0; reel < board.length; reel++) {
		for (let row = VISIBLE_ROW_START; row <= VISIBLE_ROW_END; row++) {
			const name = board[reel][row]?.name;
			if (!name || !isPayingSymbol(name)) continue;

			const key = positionKey({ reel, row });
			if (claimed.has(key)) continue;

			const positions = floodCluster(board, { reel, row }, name, claimed);
			if (positions.length < MIN_CLUSTER_SIZE) continue;

			const payMultiplier = getClusterPayMultiplier(name, positions.length);
			if (payMultiplier === null) continue;

			wins.push({
				symbol: name,
				positions,
				clusterSize: positions.length,
				payMultiplier,
			});
		}
	}

	return wins;
};

export const toBookWinAmount = (payMultiplier: number) => Math.round(payMultiplier * 100);

type BookWin = BookEventOfType<'winInfo'>['wins'][number];

const positionsOverlap = (a: Position[], b: Position[]) => {
	const keys = new Set(b.map(positionKey));
	return a.filter((position) => keys.has(positionKey(position))).length;
};

const findMatchingBookWin = (
	boardClusters: BoardClusterWin[],
	cluster: BoardClusterWin,
	bookWins: BookWin[],
) => {
	const symbolWins = bookWins.filter((win) => win.symbol === cluster.symbol);

	return symbolWins.find(
		(win) => positionsOverlap(win.positions, cluster.positions) >= MIN_CLUSTER_SIZE,
	);
};

/** Only wins that are visible, connected, same-symbol clusters of 5+ on the current board. */
export const filterValidBookWins = (board: RawSymbol[][], wins: BookWin[]): BookWin[] => {
	const boardClusters = findPayingClusters(board);

	return wins.filter((win) => {
		if (win.positions.length < MIN_CLUSTER_SIZE) return false;
		if (!win.positions.every(isVisibleBoardPosition)) return false;
		if (!win.positions.every((pos) => positionMatchesWinSymbol(board, pos, win.symbol))) {
			return false;
		}

		const matchingBoardCluster = boardClusters.find(
			(cluster) =>
				cluster.symbol === win.symbol &&
				cluster.clusterSize >= MIN_CLUSTER_SIZE &&
				positionsOverlap(win.positions, cluster.positions) >= MIN_CLUSTER_SIZE,
		);
		if (matchingBoardCluster) {
			return true;
		}

		const clusters = getValidClusters(win.positions, MIN_CLUSTER_SIZE);
		return (
			clusters.length === 1 &&
			clusters[0].length === win.positions.length &&
			clusters[0].every((pos) => positionMatchesWinSymbol(board, pos, win.symbol))
		);
	});
};

export const clusterWinToBookMeta = (cluster: BoardClusterWin) => {
	const winWithoutMult = toBookWinAmount(cluster.payMultiplier);
	const overlay = getClusterCenter(cluster.positions);

	return {
		symbol: cluster.symbol,
		clusterSize: cluster.clusterSize,
		win: winWithoutMult,
		positions: cluster.positions,
		meta: {
			globalMult: 1,
			clusterMult: 1,
			winWithoutMult,
			overlay,
		},
	};
};

const isStructurallyValidBookWin = (win: BookWin) => {
	if (win.positions.length < MIN_CLUSTER_SIZE) return false;
	if (!win.positions.every(isVisibleBoardPosition)) return false;

	const components = getValidClusters(win.positions, MIN_CLUSTER_SIZE);
	return components.length === 1 && components[0].length === win.positions.length;
};

const bookWinSymbolsMatchBoard = (board: RawSymbol[][], win: BookWin) =>
	win.positions.every((pos) => positionMatchesWinSymbol(board, pos, win.symbol));

/** Prefer board-aligned wins; always honor sanitized book wins that match the live board. */
export const resolveWinInfoWins = (
	board: RawSymbol[][],
	bookWins: BookWin[],
): BookWin[] => {
	const structuralBookWins = bookWins.filter(isStructurallyValidBookWin);
	if (structuralBookWins.length === 0) return [];

	const boardValidated = filterValidBookWins(board, bookWins);
	if (boardValidated.length > 0) return boardValidated;

	const symbolConfirmedBookWins = structuralBookWins.filter((win) =>
		bookWinSymbolsMatchBoard(board, win),
	);
	if (symbolConfirmedBookWins.length > 0) return symbolConfirmedBookWins;

	const boardClusters = findPayingClusters(board);
	if (boardClusters.length > 0) {
		return boardClusters.map((cluster) => {
			const detected = clusterWinToBookMeta(cluster);
			const bookMatch = findMatchingBookWin(boardClusters, cluster, bookWins);

			if (!bookMatch?.meta) return detected;

			return {
				...detected,
				win: Math.round(
					(bookMatch.meta.winWithoutMult ?? detected.win) *
						(bookMatch.meta.globalMult ?? 1) *
						(bookMatch.meta.clusterMult ?? 1),
				),
				meta: {
					...detected.meta,
					globalMult: bookMatch.meta.globalMult ?? 1,
					clusterMult: bookMatch.meta.clusterMult ?? 1,
					winWithoutMult: bookMatch.meta.winWithoutMult ?? detected.meta.winWithoutMult,
					overlay: bookMatch.meta.overlay ?? detected.meta.overlay,
				},
			};
		});
	}

	return structuralBookWins;
};