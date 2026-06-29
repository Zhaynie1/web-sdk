import _ from 'lodash';

import { recordBookEvent, checkIsMultipleRevealEvents, type BookEventHandlerMap } from 'utils-book';
import { stateBet } from 'state-shared';
import { waitForTimeout } from 'utils-shared/wait';
import { bookEventAmountToBetAmountMultiplier } from 'utils-shared/amount';

import * as starpetal from '$starpetal/bridge';
import { bookEventHandlers as starpetalBookEventHandlers } from '$starpetal/features';

import { eventEmitter } from './eventEmitter';
import { playBookEvent } from './utils';
import { winLevelMap, type WinLevel, type WinLevelData } from './winLevelMap';
import { stateGame, stateGameDerived } from './stateGame.svelte';
import type { BookEvent, BookEventOfType, BookEventContext } from './typesBookEvent';
import type { Position } from './types';

// Safety net for win/tumble presentation steps: if an animation's completion event is
// ever dropped (most likely on a long, retriggered bonus with many cascades), proceed
// after this cap instead of hanging the round forever.
const ANIM_TIMEOUT_MS = 2500;
const withTimeout = <T>(p: Promise<T>, ms = ANIM_TIMEOUT_MS) =>
	Promise.race([p, waitForTimeout(ms)]);

// Win-screen tier chosen from the win's multiple of the bet (DISPLAY ONLY — payouts and
// RTP still come from the book unchanged; this only picks which celebration shows):
//   ≥ 100x → top-tier screen (EPIC), 50–99x → BIG WIN, ≥ 15x → NICE WIN, below 15x → none.
const WIN_TIER_TOP: WinLevel = 9; // EPIC WIN!
const winLevelFromBetMultiple = (bookEventAmount: number): WinLevel | null => {
	const multiple = bookEventAmountToBetAmountMultiplier(bookEventAmount);
	if (multiple >= 100) return WIN_TIER_TOP;
	if (multiple >= 50) return 6; // BIG WIN
	if (multiple >= 15) return 4; // NICE WIN
	return null;
};

const winLevelSoundsPlay = ({ winLevelData }: { winLevelData: WinLevelData }) => {
	if (winLevelData?.alias === 'max') eventEmitter.broadcastAsync({ type: 'uiHide' });
	// One unified, on-theme win sound for every level — no per-level template jingles,
	// bgm, or coin loop (those included the off-theme/"country" cues).
	eventEmitter.broadcast({ type: 'soundWinCelebration' });
};

const winLevelSoundsStop = () => {
	eventEmitter.broadcast({ type: 'soundStop', name: 'sfx_bigwin_coinloop' });
	if (stateBet.activeBetModeKey === 'SUPERSPIN' || stateGame.gameType === 'freegame') {
		// check if SUPERSPIN, when finishing a bet.
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });
	} else {
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_main' });
	}
	eventEmitter.broadcastAsync({ type: 'uiShow' });
};

const animateSymbols = async ({ positions }: { positions: Position[] }) => {
	eventEmitter.broadcast({ type: 'boardShow' });
	await eventEmitter.broadcastAsync({
		type: 'boardWithAnimateSymbols',
		symbolPositions: positions,
	});
};

// --- Starpetal Awakening (super) underlying-multiplier grid ------------------------
// Simulated client-side so each super bonus starts its 18 × 2x in random cells, then
// grows a 2x wherever a winning symbol lands and doubles it on each later hit. The hit
// cells are read from the book's own grid deltas (the book grows exactly the cells the
// winning symbols cover), so multipliers always bloom where the symbol hit. Purely
// cosmetic — payouts come from the book unchanged; only the grid display is simulated.
const SUPER_GRID_ROWS = 7;
const SUPER_GRID_COLS = 7;
const SUPER_START_COUNT = 18;

let superGridActive = false;
let superSimGrid: number[][] | null = null;
let prevBookGrid: number[][] | null = null;

const makeRandomSuperGrid = () => {
	const grid = Array.from({ length: SUPER_GRID_ROWS }, () =>
		Array.from({ length: SUPER_GRID_COLS }, () => 0),
	);
	const cells: Array<[number, number]> = [];
	for (let r = 0; r < SUPER_GRID_ROWS; r += 1)
		for (let c = 0; c < SUPER_GRID_COLS; c += 1) cells.push([r, c]);
	for (let i = cells.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[cells[i], cells[j]] = [cells[j], cells[i]];
	}
	for (let k = 0; k < SUPER_START_COUNT && k < cells.length; k += 1) {
		const [r, c] = cells[k];
		grid[r][c] = 2;
	}
	return grid;
};

// Mirror the book's per-cell hits onto the simulated grid: any cell whose book value
// rose since the previous grid was hit this step → empty becomes 2x, otherwise doubles.
const applyHitsToSuperGrid = (bookGrid: number[][]) => {
	if (!superSimGrid) return;
	for (let r = 0; r < bookGrid.length; r += 1) {
		for (let c = 0; c < bookGrid[r].length; c += 1) {
			const before = prevBookGrid?.[r]?.[c] ?? 0;
			if (bookGrid[r][c] > before && superSimGrid[r]) {
				const current = superSimGrid[r][c] ?? 0;
				superSimGrid[r][c] = current > 0 ? current * 2 : 2;
			}
		}
	}
};

const baseBookEventHandlerMap: BookEventHandlerMap<BookEvent, BookEventContext> = {
	reveal: async (bookEvent: BookEventOfType<'reveal'>, { bookEvents }: BookEventContext) => {
		eventEmitter.broadcast({ type: 'tumbleWinAmountReset' });
		const isBonusGame = checkIsMultipleRevealEvents({ bookEvents });
		if (isBonusGame) {
			eventEmitter.broadcast({ type: 'stopButtonEnable' });
			// Skip RGS round-recording on the dev offline route.
			if (starpetal.shouldRecordBookEvent()) recordBookEvent({ bookEvent });
		}

		stateGame.gameType = bookEvent.gameType;
		await stateGameDerived.enhancedBoard.spin({ revealEvent: bookEvent });
		eventEmitter.broadcast({ type: 'soundScatterCounterClear' });
	},
	winInfo: async (bookEvent: BookEventOfType<'winInfo'>) => {
		const promise1 = async () => {
			eventEmitter.broadcast({ type: 'soundClusterHighlight' });
			await animateSymbols({ positions: _.flatten(bookEvent.wins.map((win) => win.positions)) });
		};

		const promise2 = async () => {
			await eventEmitter.broadcastAsync({
				type: 'showClusterWinAmounts',
				wins: bookEvent.wins.map((win) => {
					return {
						win: win.meta.winWithoutMult,
						mult: win.meta.globalMult,
						result: win.meta.winWithoutMult * win.meta.globalMult,
						reel: win.meta.overlay.reel,
						row: win.meta.overlay.row,
					};
				}),
			});
		};

		await withTimeout(Promise.all([promise1(), promise2()]));
	},
	updateTumbleWin: async (bookEvent: BookEventOfType<'updateTumbleWin'>) => {
		if (bookEvent.amount > 0) {
			eventEmitter.broadcast({ type: 'tumbleWinAmountShow' });
			eventEmitter.broadcast({
				type: 'tumbleWinAmountUpdate',
				amount: bookEvent.amount,
				animate: false,
			});
		}
	},
	setTotalWin: async (bookEvent: BookEventOfType<'setTotalWin'>) => {
		stateBet.winBookEventAmount = bookEvent.amount;
	},
	freeSpinTrigger: async (bookEvent: BookEventOfType<'freeSpinTrigger'>) => {
		// New super bonus → seed a fresh random 18 × 2x underlying-multiplier layout.
		// Detect Awakening by its variant, or fall back to its 12-spin award.
		superGridActive =
			(bookEvent as { bonusVariant?: string }).bonusVariant === 'awakening' ||
			bookEvent.totalFs === 12;
		superSimGrid = superGridActive ? makeRandomSuperGrid() : null;
		prevBookGrid = null;
		// animate scatters
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_scatter_win_v2' });
		await animateSymbols({ positions: bookEvent.positions });
		// show free spin intro
		await eventEmitter.broadcastAsync({ type: 'uiHide' });
		await eventEmitter.broadcastAsync({ type: 'transition' });
		eventEmitter.broadcast({ type: 'freeSpinIntroShow' });
		eventEmitter.broadcast({ type: 'soundBonusEntry' });
		await eventEmitter.broadcastAsync({
			type: 'freeSpinIntroUpdate',
			totalFreeSpins: bookEvent.totalFs,
		});
		stateGame.gameType = 'freegame';
		eventEmitter.broadcast({ type: 'freeSpinIntroHide' });
		eventEmitter.broadcast({ type: 'boardFrameGlowShow' });
		eventEmitter.broadcast({ type: 'globalMultiplierShow' });
		await eventEmitter.broadcastAsync({
			type: 'globalMultiplierUpdate',
			multiplier: 1, // resets when multiplier === 1
		});
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
	freeSpinRetrigger: async (bookEvent: BookEventOfType<'freeSpinTrigger'>) => {
		// animate scatters
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_scatter_win_v2' });
		await animateSymbols({ positions: bookEvent.positions });
		// show free spin intro
		await eventEmitter.broadcastAsync({ type: 'uiHide' });
		await eventEmitter.broadcastAsync({ type: 'transition' });
		eventEmitter.broadcast({ type: 'freeSpinIntroShow' });
		eventEmitter.broadcast({ type: 'soundBonusEntry' });
		await eventEmitter.broadcastAsync({
			type: 'freeSpinIntroUpdate',
			totalFreeSpins: bookEvent.totalFs,
		});
		stateGame.gameType = 'freegame';
		eventEmitter.broadcast({ type: 'freeSpinIntroHide' });
		eventEmitter.broadcast({ type: 'boardFrameGlowShow' });
		eventEmitter.broadcast({ type: 'globalMultiplierShow' });
		await eventEmitter.broadcastAsync({
			type: 'globalMultiplierUpdate',
			multiplier: 1, // resets when multiplier === 1
		});
		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: undefined,
			total: bookEvent.totalFs,
		});
		await eventEmitter.broadcastAsync({ type: 'uiShow' });
	},
	updateFreeSpin: async (bookEvent: BookEventOfType<'updateFreeSpin'>) => {
		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: bookEvent.amount,
			total: bookEvent.total,
		});
	},
	updateGlobalMult: async (bookEvent: BookEventOfType<'updateGlobalMult'>) => {
		eventEmitter.broadcast({ type: 'globalMultiplierShow' });
		if (bookEvent.globalMult === 1) {
			eventEmitter.broadcast({ type: 'tumbleWinAmountReset' });
		}
		await eventEmitter.broadcastAsync({
			type: 'globalMultiplierUpdate',
			multiplier: bookEvent.globalMult, // resets when multiplier === 1
		});
	},
	freeSpinEnd: async (bookEvent: BookEventOfType<'freeSpinEnd'>) => {
		// Bonus total uses the same bet-multiple tiers, but the outro always shows (floor
		// at NICE so a small bonus still gets a closing screen).
		const winLevelData = winLevelMap[winLevelFromBetMultiple(bookEvent.amount) ?? 4];

		await eventEmitter.broadcastAsync({ type: 'uiHide' });
		stateGame.gameType = 'basegame';
		eventEmitter.broadcast({ type: 'boardFrameGlowHide' });
		eventEmitter.broadcast({ type: 'globalMultiplierHide' });
		eventEmitter.broadcast({ type: 'freeSpinOutroShow' });
		winLevelSoundsPlay({ winLevelData });
		await eventEmitter.broadcastAsync({
			type: 'freeSpinOutroCountUp',
			amount: bookEvent.amount,
			winLevelData,
		});
		winLevelSoundsStop();
		eventEmitter.broadcast({ type: 'freeSpinOutroHide' });
		eventEmitter.broadcast({ type: 'freeSpinCounterHide' });
		eventEmitter.broadcast({ type: 'globalMultiplierHide' });
		eventEmitter.broadcast({ type: 'tumbleWinAmountHide' });
		await eventEmitter.broadcastAsync({ type: 'transition' });
		await eventEmitter.broadcastAsync({ type: 'uiShow' });
		await eventEmitter.broadcastAsync({ type: 'drawerUnfold' });
		eventEmitter.broadcast({ type: 'drawerButtonHide' });
	},
	tumbleBoard: async (bookEvent: BookEventOfType<'tumbleBoard'>) => {
		eventEmitter.broadcast({ type: 'boardHide' });
		eventEmitter.broadcast({ type: 'tumbleBoardShow' });
		eventEmitter.broadcast({ type: 'tumbleBoardInit', addingBoard: bookEvent.newSymbols });
		eventEmitter.broadcast({ type: 'soundClusterConnect' });
		await withTimeout(
			eventEmitter.broadcastAsync({
				type: 'tumbleBoardExplode',
				explodingPositions: bookEvent.explodingSymbols,
			}),
		);
		eventEmitter.broadcast({ type: 'tumbleBoardRemoveExploded' });
		await withTimeout(eventEmitter.broadcastAsync({ type: 'tumbleBoardSlideDown' }));
		eventEmitter.broadcast({
			type: 'boardSettle',
			board: stateGameDerived
				.tumbleBoardCombined()
				.map((tumbleReel) => tumbleReel.map((tumbleSymbol) => tumbleSymbol.rawSymbol)),
		});
		eventEmitter.broadcast({ type: 'tumbleBoardReset' });
		eventEmitter.broadcast({ type: 'tumbleBoardHide' });
		eventEmitter.broadcast({ type: 'boardShow' });
	},
	setWin: async (bookEvent: BookEventOfType<'setWin'>) => {
		// Tier by multiple of the bet: ≥15x NICE, 50–99x BIG, ≥100x top. Below 15x there's
		// no celebration screen — the win just settles into the balance.
		const level = winLevelFromBetMultiple(bookEvent.amount);
		if (level === null) return;
		const winLevelData = winLevelMap[level];

		eventEmitter.broadcast({ type: 'winShow' });
		winLevelSoundsPlay({ winLevelData });
		await eventEmitter.broadcastAsync({
			type: 'winUpdate',
			amount: bookEvent.amount,
			winLevelData,
		});
		winLevelSoundsStop();
		eventEmitter.broadcast({ type: 'winHide' });
	},
	updateGrid: async (bookEvent: BookEventOfType<'updateGrid'>) => {
		eventEmitter.broadcast({ type: 'multiplierGridShow' });
		// Super bonus shows the client-simulated grid (random 18 start + grow-on-hit);
		// every other mode shows the book's grid as-is. Either way a multiplier blooms at
		// the exact cell a winning symbol hit (the book grows those same cells).
		let grid = bookEvent.gridMultipliers;
		if (superGridActive && superSimGrid) {
			// First grid after the trigger is the book's seed — keep our random layout;
			// from then on, fold each step's hits into the simulated grid.
			if (prevBookGrid !== null) applyHitsToSuperGrid(bookEvent.gridMultipliers);
			prevBookGrid = bookEvent.gridMultipliers;
			grid = superSimGrid.map((row) => [...row]);
		}
		eventEmitter.broadcast({ type: 'multiplierGridUpdate', grid });
	},
	finalWin: async (bookEvent: BookEventOfType<'finalWin'>) => {
		superGridActive = false;
		superSimGrid = null;
		prevBookGrid = null;
		eventEmitter.broadcast({ type: 'multiplierGridClear' });
		eventEmitter.broadcast({ type: 'multiplierGridHide' });
		eventEmitter.broadcast({ type: 'globalMultiplierHide' });
		eventEmitter.broadcast({ type: 'tumbleWinAmountHide' });
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

		if (lastFreeSpinTriggerEvent) await playBookEvent(lastFreeSpinTriggerEvent, { bookEvents });
		if (lastUpdateFreeSpinEvent) playBookEvent(lastUpdateFreeSpinEvent, { bookEvents });
		if (lastSetTotalWinEvent) playBookEvent(lastSetTotalWinEvent, { bookEvents });
		if (lastUpdateGlobalMultEvent) playBookEvent(lastUpdateGlobalMultEvent, { bookEvents });
	},
};

// Seam: starpetal custom book-events merge over the engine's base handlers.
export const bookEventHandlerMap: BookEventHandlerMap<BookEvent, BookEventContext> = {
	...baseBookEventHandlerMap,
	...starpetalBookEventHandlers,
};
