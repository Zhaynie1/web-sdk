import type { BetType } from 'rgs-requests';

import type { SymbolName, RawSymbol, GameType, Position } from './types';

type BookEventReveal = {
	index: number;
	type: 'reveal';
	board: RawSymbol[][];
	paddingPositions: number[];
	anticipation: number[];
	gameType: GameType;
};

type BookEventWinInfo = {
	index: number;
	type: 'winInfo';
	totalWin: number;
	wins: {
		symbol: SymbolName;
		win: number;
		positions: Position[];
		meta: {
			globalMult: number;
			clusterMult: number;
			winWithoutMult: number;
			overlay: Position;
		};
	}[];
};

type BookEventSetTumbleWin = {
	index: number;
	type: 'updateTumbleWin';
	amount: number;
};

type BookEventSetTotalWin = {
	index: number;
	type: 'setTotalWin';
	amount: number;
};

type BookEventFreeSpinTrigger = {
	index: number;
	type: 'freeSpinTrigger';
	totalFs: number;
	positions: Position[];
	bonusVariant?: 'standard' | 'awakening' | 'mystery';
};

type BookEventFreeSpinRetrigger = {
	index: number;
	type: 'freeSpinRetrigger';
	totalFs: number;
	positions: Position[];
};

type BookEventUpdateFreeSpin = {
	index: number;
	type: 'updateFreeSpin';
	amount: number;
	total: number;
};

type BookEventUpdateGlobalMult = {
	index: number;
	type: 'updateGlobalMult';
	globalMult: number;
};

type BookEventUpdateGrid = {
	index: number;
	type: 'updateGrid';
	gridMultipliers: number[][];
};

type BookEventFreeSpinEnd = {
	index: number;
	type: 'freeSpinEnd';
	amount: number;
	winLevel: number;
};

type BookEventBoardMultiplierInfo = {
	index: number;
	type: 'boardMultiplierInfo';
	multInfo: {
		positions: (Position & { multiplier: number })[];
	};
	winInfo: {
		tumbleWin: number;
		boardMult: number;
		totalWin: number;
	};
};

type BookEventMultiplierDewdropPlace = {
	index: number;
	type: 'multiplierDewdropPlace';
	positions: (Position & { multiplier: number })[];
};

type BookEventTumbleBoard = {
	index: number;
	type: 'tumbleBoard';
	explodingSymbols: Position[];
	newSymbols: RawSymbol[][];
};

type BookEventFinalWin = {
	index: number;
	type: 'finalWin';
	amount: number;
};

type BookEventSetWin = {
	index: number;
	type: 'setWin';
	amount: number;
	winLevel: number;
};

type BookEventWincap = {
	index: number;
	type: 'wincap';
	amount: number;
};

// customised
type BookEventCreateBonusSnapshot = {
	index: number;
	type: 'createBonusSnapshot';
	bookEvents: BookEvent[];
};

type BookEventStarfall = {
	index: number;
	type: 'starfall';
	effect: 'wildVine' | 'multiplierDewdrop';
	positions: Position[];
	multiplier: number;
};

type BookEventBloomLink = {
	index: number;
	type: 'bloomLink';
	bridgePositions: Position[];
	connectedSymbol: string;
};

type BookEventPetalSpread = {
	index: number;
	type: 'petalSpread';
	positions: Position[];
};

type BookEventStickyWildVines = {
	index: number;
	type: 'stickyWildVines';
	positions: Position[];
};

type BookEventSymbolUpgrade = {
	index: number;
	type: 'symbolUpgrade';
	positions: Position[];
	fromSymbol: string;
	toSymbol: string;
};

export type BookEvent =
	| BookEventReveal
	| BookEventWinInfo
	| BookEventBoardMultiplierInfo
	| BookEventMultiplierDewdropPlace
	| BookEventSetTumbleWin
	| BookEventSetTotalWin
	| BookEventFreeSpinTrigger
	| BookEventFreeSpinRetrigger
	| BookEventUpdateFreeSpin
	| BookEventUpdateGlobalMult
	| BookEventUpdateGrid
	| BookEventTumbleBoard
	| BookEventCreateBonusSnapshot
	| BookEventFinalWin
	| BookEventSetWin
	| BookEventWincap
	| BookEventFreeSpinEnd
	// customised
	| BookEventCreateBonusSnapshot
	| BookEventStarfall
	| BookEventBloomLink
	| BookEventPetalSpread
	| BookEventStickyWildVines
	| BookEventSymbolUpgrade;

export type Bet = BetType<BookEvent>;
export type BookEventOfType<T> = Extract<BookEvent, { type: T }>;
export type BookEventContext = { bookEvents: BookEvent[] };
