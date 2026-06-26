import _ from 'lodash';

import { recordBookEvent, checkIsMultipleRevealEvents, type BookEventHandlerMap } from 'utils-book';
import { stateBet } from 'state-shared';

import { eventEmitter } from './eventEmitter';
import { playBookEvent } from './utils';
import {
	capWinPresentDuration,
	getFreeSpinOutroWinLevelData,
	resolveSetWinLevelData,
} from './getCenterWinLevelData';
import { waitForTimeout } from 'utils-shared/wait';
import { winLevelMap, type WinLevel, type WinLevelData } from './winLevelMap';
import { stateGame, stateGameDerived } from './stateGame.svelte';
import type { BookEvent, BookEventOfType, BookEventContext } from './typesBookEvent';
import type { Position } from './types';
import { isVisibleBoardPosition, resolveWinInfoWins } from './evaluateBoardClusters';
import { buildTumbledBoard, cloneBoard } from './sanitizeBook';
import { isScatterSymbol, resolveScatterAnticipation } from './scatterAnticipation';
import { freeSpinIntroPressGate } from './bonusPanelPress';
import { revealRoundHasWin } from './betRoundWin';
import { isAutoSpinActive, shouldAutoAdvancePanels, shouldFastPathAnimations } from './panelWait';
import { prepareBoardForSpin, recoverFrozenReels } from './spinSafety';

const withBookEventTimeout = async <T>(
	promise: Promise<T>,
	timeoutMs: number,
	label: string,
	onTimeout?: () => void,
) => {
	let timedOut = false;
	await Promise.race([
		promise,
		waitForTimeout(timeoutMs).then(() => {
			timedOut = true;
			console.warn(`[starpetal-harvest] Book event timed out: ${label}`);
			onTimeout?.();
		}),
	]);
	return { timedOut };
};

const winLevelSoundsPlay = ({ winLevelData }: { winLevelData: WinLevelData }) => {
	if (winLevelData?.alias === 'max') eventEmitter.broadcastAsync({ type: 'uiHide' });
	if (winLevelData?.type === 'medium' || winLevelData?.type === 'big') {
		eventEmitter.broadcast({ type: 'soundTotalWinNoiseStart' });
	}
};

const winLevelSoundsStop = () => {
	eventEmitter.broadcast({ type: 'soundTotalWinNoiseStop' });
	if (stateGame.gameType !== 'freeSpins') {
		eventEmitter.broadcastAsync({ type: 'uiShow' });
	}
};

const resolveScatterPositions = (positions: Position[]) => {
	const board = stateGameDerived.boardRaw();
	return positions.filter((pos) => isScatterSymbol(board[pos.reel]?.[pos.row]));
};

const animateSymbols = async ({ positions }: { positions: Position[] }) => {
	if (shouldFastPathAnimations()) return;

	const scatterPositions = resolveScatterPositions(positions);
	if (scatterPositions.length === 0) return;

	eventEmitter.broadcast({ type: 'boardShow' });
	await eventEmitter.broadcastAsync({
		type: 'boardWithAnimateSymbols',
		symbolPositions: scatterPositions,
	});
};

export const bookEventHandlerMap: BookEventHandlerMap<BookEvent, BookEventContext> = {
	reveal: async (bookEvent: BookEventOfType<'reveal'>, { bookEvents }: BookEventContext) => {
		eventEmitter.broadcast({ type: 'boardClearClusterHighlight' });
		stateBet.forceNormalSpinPacing =
			(stateBet.isTurbo || isAutoSpinActive()) &&
			revealRoundHasWin(bookEvents, bookEvent.index);

		const isBonusGame = checkIsMultipleRevealEvents({ bookEvents });
		if (isBonusGame) {
			eventEmitter.broadcast({ type: 'stopButtonEnable' });
			recordBookEvent({ bookEvent });
		}

		eventEmitter.broadcast({ type: 'tumbleWinAmountHide' });
		eventEmitter.broadcast({ type: 'tumbleWinAmountReset' });
		stateGame.liveTumbleWin = 0;
		stateGame.bonusTumbling = false;
		stateGameDerived.applyRevealGameType(bookEvent.gameType);
		if (stateGameDerived.isFreeSpinsFeatureActive()) {
			stateGame.spinStartFeatureWin = Math.max(
				0,
				stateBet.winBookEventAmount - stateGame.featureWinOffset,
			);
		}
		const { anticipation } = resolveScatterAnticipation({
			board: bookEvent.board,
			bookAnticipation: bookEvent.anticipation,
		});
		try {
			await stateGameDerived.enhancedBoard.spin({
				revealEvent: { ...bookEvent, anticipation },
			});
		} catch (error) {
			console.warn('[starpetal-harvest] reveal spin failed, recovering board', error);
			recoverFrozenReels();
		} finally {
			stateGame.logicalBoard = cloneBoard(bookEvent.board);
			const needsRecovery = stateGame.board.some((reel) => reel.reelState.motion !== 'stopped');
			if (needsRecovery) {
				stateGameDerived.enhancedBoard.settle(bookEvent.board);
			}
		}
		eventEmitter.broadcast({ type: 'soundScatterCounterClear' });
	},
	winInfo: async (bookEvent: BookEventOfType<'winInfo'>) => {
		eventEmitter.broadcast({ type: 'boardClearClusterHighlight' });
		const board = stateGameDerived.boardRaw();
		stateGameDerived.enhancedBoard.syncSymbolPositions();
		const validWins = resolveWinInfoWins(board, bookEvent.wins);
		if (validWins.length === 0) return;

		const clusterPositions = _.flatten(validWins.map((win) => win.positions));
		stateGame.pendingTumbleExplodePositions = clusterPositions;

		if (shouldFastPathAnimations()) {
			eventEmitter.broadcast({ type: 'soundClusterConnect' });
			return;
		}

		const highlightClusters = async () => {
			await eventEmitter.broadcastAsync({
				type: 'boardHighlightCluster',
				symbolPositions: clusterPositions,
			});
		};

		const showClusterAmounts = async () => {
			await eventEmitter.broadcastAsync({
				type: 'showClusterWinAmounts',
				wins: validWins.map((win) => {
					const meta = win.meta ?? {
						globalMult: 1,
						clusterMult: 1,
						winWithoutMult: win.win,
						overlay: win.positions[0] ?? { reel: 0, row: 1 },
					};
					const overlay = meta.overlay ?? win.positions[0] ?? { reel: 0, row: 1 };
					return {
						win: meta.winWithoutMult ?? win.win,
						mult: (meta.globalMult ?? 1) * (meta.clusterMult ?? 1),
						result: win.win,
						reel: overlay.reel,
						row: overlay.row,
						symbol: win.symbol,
						amountOnly: true,
					};
				}),
			});
		};

		await withBookEventTimeout(
			Promise.all([highlightClusters(), showClusterAmounts()]),
			4_000,
			'winInfo cluster highlight',
		);
	},
	updateTumbleWin: async (bookEvent: BookEventOfType<'updateTumbleWin'>) => {
		if (bookEvent.amount <= 0) return;

		if (stateGameDerived.isFreeSpinsFeatureActive()) {
			stateGame.liveTumbleWin = bookEvent.amount;
			stateGame.bonusTumbling = true;
		}

		eventEmitter.broadcast({ type: 'tumbleWinAmountShow' });
		eventEmitter.broadcast({
			type: 'tumbleWinAmountUpdate',
			amount: bookEvent.amount,
			animate: false,
		});
	},
	setTotalWin: async (bookEvent: BookEventOfType<'setTotalWin'>) => {
		stateBet.winBookEventAmount = bookEvent.amount;
	},
	freeSpinTrigger: async (bookEvent: BookEventOfType<'freeSpinTrigger'>) => {
		stateGame.gameType = 'freeSpins';
		stateGame.featureWinOffset = stateBet.winBookEventAmount;
		stateGame.spinStartFeatureWin = 0;
		stateGame.liveTumbleWin = 0;
		stateGame.bonusTumbling = false;

		await animateSymbols({ positions: bookEvent.positions });
		eventEmitter.broadcast({ type: 'freeSpinIntroShow' });
		void eventEmitter.broadcastAsync({ type: 'uiHide' });
		await eventEmitter.broadcastAsync({ type: 'transition' });
		eventEmitter.broadcast({
			type: 'freeSpinIntroUpdate',
			totalFreeSpins: bookEvent.totalFs,
		});
		freeSpinIntroPressGate.arm();
		await freeSpinIntroPressGate.waitForPress();
		eventEmitter.broadcast({ type: 'freeSpinIntroHide' });
		eventEmitter.broadcast({ type: 'boardFrameGlowShow' });
		const usesTileMults =
			bookEvent.bonusVariant === 'awakening' || bookEvent.bonusVariant === 'mystery';
		if (usesTileMults) {
			eventEmitter.broadcast({ type: 'multiplierGridShow' });
		}
		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: undefined,
			total: bookEvent.totalFs,
		});
		await eventEmitter.broadcastAsync({ type: 'uiShow' });
		await eventEmitter.broadcastAsync({ type: 'drawerButtonShow' });
		eventEmitter.broadcast({ type: 'drawerFold' });
	},
	freeSpinRetrigger: async (bookEvent: BookEventOfType<'freeSpinRetrigger'>) => {
		await animateSymbols({ positions: bookEvent.positions });
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: undefined,
			total: bookEvent.totalFs,
		});
	},
	updateFreeSpin: async (bookEvent: BookEventOfType<'updateFreeSpin'>) => {
		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: bookEvent.amount,
			total: bookEvent.total,
		});
	},
	updateGlobalMult: async () => {},
	updateGrid: async (bookEvent: BookEventOfType<'updateGrid'>) => {
		eventEmitter.broadcast({ type: 'multiplierGridShow' });
		await eventEmitter.broadcastAsync({
			type: 'multiplierGridUpdate',
			grid: bookEvent.gridMultipliers,
		});
	},
	boardMultiplierInfo: async (bookEvent: BookEventOfType<'boardMultiplierInfo'>) => {
		const runMultiplierCollect = async () => {
			eventEmitter.broadcast({ type: 'tumbleWinAmountShow' });
			eventEmitter.broadcast({ type: 'tumbleWinAmountReset' });
			eventEmitter.broadcast({
				type: 'tumbleWinAmountUpdate',
				amount: bookEvent.winInfo.tumbleWin,
				animate: false,
			});

			if (shouldFastPathAnimations()) {
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

		await withBookEventTimeout(runMultiplierCollect(), 12_000, 'boardMultiplierInfo', () => {
			eventEmitter.broadcast({ type: 'multiplierBoardReset' });
			eventEmitter.broadcast({ type: 'multiplierBoardHide' });
			eventEmitter.broadcast({ type: 'multiplierTotalHide' });
			eventEmitter.broadcast({ type: 'tumbleWinAmountHide' });
		});
		if (stateGame.logicalBoard) {
			stateGameDerived.enhancedBoard.settle(stateGame.logicalBoard);
		}
	},
	freeSpinEnd: async (bookEvent: BookEventOfType<'freeSpinEnd'>) => {
		const winLevelData = getFreeSpinOutroWinLevelData(bookEvent);
		if (!winLevelData) return;

		await waitForTimeout(280);
		stateGame.gameType = 'basegame';
		stateGame.featureWinOffset = 0;
		stateGame.spinStartFeatureWin = 0;
		stateGame.liveTumbleWin = 0;
		stateGame.bonusTumbling = false;
		eventEmitter.broadcast({ type: 'boardFrameGlowHide' });
		eventEmitter.broadcast({ type: 'multiplierGridClear' });
		eventEmitter.broadcast({ type: 'multiplierGridHide' });
		eventEmitter.broadcast({ type: 'freeSpinCounterHide' });
		eventEmitter.broadcast({ type: 'freeSpinOutroShow' });
		void eventEmitter.broadcastAsync({ type: 'uiHide' });
		winLevelSoundsPlay({ winLevelData });
		await withBookEventTimeout(
			eventEmitter.broadcastAsync({
				type: 'freeSpinOutroCountUp',
				amount: bookEvent.amount,
				winLevelData,
			}),
			22_000,
			'freeSpinOutroCountUp',
		);
		winLevelSoundsStop();
		eventEmitter.broadcast({ type: 'freeSpinOutroHide' });
		await eventEmitter.broadcastAsync({ type: 'transition' });
		await eventEmitter.broadcastAsync({ type: 'uiShow' });
		await eventEmitter.broadcastAsync({ type: 'drawerUnfold' });
		eventEmitter.broadcast({ type: 'drawerButtonHide' });
	},
	tumbleBoard: async (bookEvent: BookEventOfType<'tumbleBoard'>) => {
		eventEmitter.broadcast({ type: 'boardClearClusterHighlight' });
		stateGame.pendingTumbleExplodePositions = [];

		const explodePositions = bookEvent.explodingSymbols.filter(isVisibleBoardPosition);
		if (explodePositions.length === 0) return;

		const boardBeforeTumble =
			stateGame.logicalBoard ?? stateGameDerived.boardRaw();

		const settledBoard = buildTumbledBoard(
			boardBeforeTumble,
			explodePositions,
			bookEvent.newSymbols,
		);

		const runTumble = async () => {
			if (shouldFastPathAnimations()) return;

			await eventEmitter.broadcastAsync({
				type: 'boardExplodeSymbols',
				symbolPositions: explodePositions,
			});

			await eventEmitter.broadcastAsync({
				type: 'boardTumbleRefill',
				explodePositions,
				settledBoard,
			});
		};

		const { timedOut } = await withBookEventTimeout(runTumble(), 8_000, 'tumbleBoard', recoverFrozenReels);
		stateGame.logicalBoard = cloneBoard(settledBoard);
		eventEmitter.broadcast({ type: 'boardSettle', board: settledBoard });
		if (timedOut) prepareBoardForSpin(settledBoard);
	},
	setWin: async (bookEvent: BookEventOfType<'setWin'>) => {
		const winLevelData = resolveSetWinLevelData(bookEvent);
		if (!winLevelData) return;

		if (shouldAutoAdvancePanels() && !stateBet.forceNormalSpinPacing) {
			winLevelSoundsPlay({ winLevelData });
			winLevelSoundsStop();
			if (!stateGameDerived.isFreeSpinsFeatureActive()) {
				eventEmitter.broadcast({ type: 'tumbleWinAmountHide' });
				eventEmitter.broadcast({ type: 'tumbleWinAmountReset' });
			}
			return;
		}

		if (!stateGameDerived.isFreeSpinsFeatureActive()) {
			eventEmitter.broadcast({ type: 'tumbleWinAmountHide' });
			eventEmitter.broadcast({ type: 'tumbleWinAmountReset' });
		}

		eventEmitter.broadcast({ type: 'winShow' });
		winLevelSoundsPlay({ winLevelData });
		const presentMs = capWinPresentDuration(winLevelData.presentDuration ?? 0);
		await withBookEventTimeout(
			eventEmitter.broadcastAsync({
				type: 'winUpdate',
				amount: bookEvent.amount,
				winLevelData,
			}),
			presentMs + 2_500,
			'setWin',
		);
		winLevelSoundsStop();
		eventEmitter.broadcast({ type: 'winHide' });
	},
	wincap: async (bookEvent: BookEventOfType<'wincap'>) => {
		const winLevelData = winLevelMap[10 as WinLevel];

		if (shouldAutoAdvancePanels() && !stateBet.forceNormalSpinPacing) return;

		eventEmitter.broadcast({ type: 'winShow' });
		winLevelSoundsPlay({ winLevelData });
		const presentMs = capWinPresentDuration(winLevelData.presentDuration ?? 0);
		await withBookEventTimeout(
			eventEmitter.broadcastAsync({
				type: 'winUpdate',
				amount: bookEvent.amount,
				winLevelData,
			}),
			presentMs + 2_500,
			'wincap',
		);
		winLevelSoundsStop();
		eventEmitter.broadcast({ type: 'winHide' });
	},
	finalWin: async () => {
		stateBet.forceNormalSpinPacing = false;
	},
	starfall: async (bookEvent: BookEventOfType<'starfall'>) => {
		await animateSymbols({ positions: bookEvent.positions });

		const board = cloneBoard(stateGame.logicalBoard ?? stateGameDerived.boardRaw());
		for (const position of bookEvent.positions) {
			if (bookEvent.effect === 'multiplierDewdrop') {
				board[position.reel][position.row] = {
					name: 'M',
					multiplier: bookEvent.multiplier ?? 2,
				};
			} else {
				board[position.reel][position.row] = { name: 'W' };
			}
		}
		eventEmitter.broadcast({ type: 'boardSettle', board });
	},
	bloomLink: async (bookEvent: BookEventOfType<'bloomLink'>) => {
		await animateSymbols({ positions: bookEvent.bridgePositions });
	},
	petalSpread: async (bookEvent: BookEventOfType<'petalSpread'>) => {
		await animateSymbols({ positions: bookEvent.positions });
	},
	stickyWildVines: async (bookEvent: BookEventOfType<'stickyWildVines'>) => {
		await animateSymbols({ positions: bookEvent.positions });
	},
	symbolUpgrade: async (bookEvent: BookEventOfType<'symbolUpgrade'>) => {
		await animateSymbols({ positions: bookEvent.positions });
	},
	// customised
	createBonusSnapshot: async (bookEvent: BookEventOfType<'createBonusSnapshot'>) => {
		const { bookEvents } = bookEvent;

		function findLastBookEvent<T>(type: T) {
			return _.findLast(bookEvents, (bookEvent) => bookEvent.type === type) as
				| BookEventOfType<T>
				| undefined;
		}

		const lastFreeSpinTriggerEvent = findLastBookEvent('freeSpinTrigger' as const);
		const lastUpdateFreeSpinEvent = findLastBookEvent('updateFreeSpin' as const);
		const lastSetTotalWinEvent = findLastBookEvent('setTotalWin' as const);
		const lastUpdateGlobalMultEvent = findLastBookEvent('updateGlobalMult' as const);
		const lastUpdateGridEvent = findLastBookEvent('updateGrid' as const);

		if (lastFreeSpinTriggerEvent) await playBookEvent(lastFreeSpinTriggerEvent, { bookEvents });
		if (lastUpdateFreeSpinEvent) await playBookEvent(lastUpdateFreeSpinEvent, { bookEvents });
		if (lastSetTotalWinEvent) await playBookEvent(lastSetTotalWinEvent, { bookEvents });
		if (lastUpdateGlobalMultEvent) await playBookEvent(lastUpdateGlobalMultEvent, { bookEvents });
		if (lastUpdateGridEvent) await playBookEvent(lastUpdateGridEvent, { bookEvents });
	},
};
