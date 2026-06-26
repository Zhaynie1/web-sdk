import _ from 'lodash';
import type { Tween } from 'svelte/motion';

import { stateBet } from 'state-shared';

import { createBoardController } from './boardController';
import { createBoardReel } from './boardReel.svelte';
import { resolveReelPace } from './reelPacing';
import { createGetWinLevelDataByWinLevelAlias } from 'utils-shared/winLevel';

import type { GameType, Position, RawSymbol, SymbolState } from './types';

/** Book reels use `basegame` / `freegame`; UI feature state uses `freeSpins`. */
export type RuntimeGameType = GameType | 'freeSpins';
import { stateLayoutDerived } from './stateLayout';
import { getBoardLayoutPosition } from './layoutConstants';
import { winLevelMap } from './winLevelMap';
import { eventEmitter } from './eventEmitter';
import { playReelStopSound } from './starpetalSfx';
import {
	SYMBOL_SIZE,
	BOARD_SIZES,
	INITIAL_BOARD,
	BOARD_DIMENSIONS,
	INITIAL_SYMBOL_STATE,
} from './constants';

const onSymbolLand = ({ rawSymbol }: { rawSymbol: RawSymbol }) => {
	if (rawSymbol.name === 'S') {
		eventEmitter.broadcast({ type: 'soundScatterCounterIncrease' });
	}
};

const board = _.range(BOARD_DIMENSIONS.x).map((reelIndex) => {
	const reel = createBoardReel({
		reelIndex,
		symbolHeight: SYMBOL_SIZE,
		initialSymbols: INITIAL_BOARD[reelIndex],
		initialSymbolState: INITIAL_SYMBOL_STATE,
		onReelStopping: () => {
			if (!stateBet.isTurbo) playReelStopSound();
		},
		onSymbolLand,
	});

	reel.reelState.spinOptions = () => {
		const isBonus =
			stateGame.gameType === 'freeSpins' || stateGame.gameType === 'freegame';
		return resolveReelPace(reel.reelState.spinType, isBonus);
	};

	return reel;
});

export type Reel = (typeof board)[number];
export type ReelSymbol = Reel['reelState']['symbols'][number];

export type TumbleSymbol = {
	symbolY: Tween<number>;
	rawSymbol: RawSymbol;
	symbolState: SymbolState;
	oncomplete: () => void;
};

export type MultiplierSymbol = {
	initX: number;
	initY: number;
	symbolX: Tween<number>;
	symbolY: Tween<number>;
	rawSymbol: RawSymbol;
	symbolState: SymbolState;
	oncomplete: () => void;
};

export const stateGame = $state({
	board,
	gameType: 'basegame' as RuntimeGameType,
	tumbleBoardAdding: [] as TumbleSymbol[][],
	tumbleBoardBase: [] as TumbleSymbol[][],
	multiplierBoard: [] as (MultiplierSymbol | undefined)[][],
	scatterCounter: 0,
	pendingTumbleExplodePositions: [] as Position[],
	featureWinOffset: 0,
	spinStartFeatureWin: 0,
	liveTumbleWin: 0,
	bonusTumbling: false,
	scatterAnticipationHold: [] as boolean[],
	logicalBoard: null as RawSymbol[][] | null,
});

export const resetScatterAnticipationHold = (length: number) => {
	stateGame.scatterAnticipationHold = Array.from({ length }, () => false);
};

export const retainScatterAnticipationTrail = (reelIndex: number) => {
	const hold = [...stateGame.scatterAnticipationHold];
	if (reelIndex < 0 || reelIndex >= hold.length) return;
	hold[reelIndex] = true;
	stateGame.scatterAnticipationHold = hold;
};

const boardLayout = () => {
	const main = stateLayoutDerived.mainLayout();
	const { x, y } = getBoardLayoutPosition(
		stateLayoutDerived.layoutType(),
		main.width,
		main.height,
	);

	return {
	x,
	y,
	anchor: { x: 0.5, y: 0.5 },
	pivot: { x: BOARD_SIZES.width / 2, y: BOARD_SIZES.height / 2 },
	...BOARD_SIZES,
	};
};

const boardRaw = () =>
	board.map((reel) => reel.reelState.symbols.map((reelSymbol) => reelSymbol.rawSymbol));

const tumbleBoardCombined = () => {
	const tumbleBoardCombined = stateGame.tumbleBoardBase.map((tumbleReelBase, reelIndex) => {
		const tumbleReelAdding = stateGame.tumbleBoardAdding[reelIndex] ?? [];
		return [...tumbleReelAdding, ...tumbleReelBase];
	});

	return tumbleBoardCombined;
};

const scatterLandIndex = () => {
	if (stateGame.scatterCounter > 5) return 5;
	if (stateGame.scatterCounter < 1) return 1;
	return stateGame.scatterCounter as 1 | 2 | 3 | 4 | 5;
};

const { enhanceBoard } = createBoardController({
	resetScatterAnticipationHold,
	retainScatterAnticipationTrail,
});
const enhancedBoard = enhanceBoard({ board: stateGame.board });

export const { getWinLevelDataByWinLevelAlias } = createGetWinLevelDataByWinLevelAlias({
	winLevelMap,
});

const isFreeSpinsFeatureActive = () =>
	stateGame.gameType === 'freeSpins' || stateGame.gameType === 'freegame';

const applyRevealGameType = (incomingGameType: GameType) => {
	if (incomingGameType === 'freegame' || stateGame.gameType === 'freeSpins') {
		stateGame.gameType = 'freeSpins';
		return;
	}

	stateGame.gameType = incomingGameType;
};

export const stateGameDerived = {
	onSymbolLand,
	boardLayout,
	boardRaw,
	tumbleBoardCombined,
	scatterLandIndex,
	enhancedBoard,
	getWinLevelDataByWinLevelAlias,
	isFreeSpinsFeatureActive,
	applyRevealGameType,
};