import { BOOK_AMOUNT_MULTIPLIER } from 'constants-shared/bet';
import { stateBet, stateBetDerived, stateConfig, stateMeta, stateModal } from 'state-shared';
import { bookEventAmountToNormalisedAmount } from 'utils-shared/amount';
import { randomInteger } from 'utils-shared/random';
import { waitForTimeout } from 'utils-shared/wait';
import { stateSlots } from 'utils-slots';

import { BET_AMOUNT_OPTIONS, DEFAULT_BET } from './betConfig';
import { getStarpetalBetModeMeta } from './betModeMeta';
import { eventEmitter } from './eventEmitter';
import { loadBaseBooks, loadBonusBooks } from './localBooks.svelte';
import { getBaseBookCategory, pickBaseSpinCategory } from './localPlayOdds';
import type { Bet } from './typesBookEvent';
import { isLocalPlayRoute } from './localPlayRoute';
import { sanitizeBookEvents } from './sanitizeBook';
import {
	isLocalSpinInFlight,
	setBetRoundBusy,
	setLocalSpinInFlight,
	stateBetRoundBusy,
} from './betRoundBusy.svelte';
import { stateGameDerived } from './stateGame.svelte';
import {
	abortFrozenSpin,
	BOOK_ROUND_TIMEOUT_MS,
	prepareBoardForSpin,
	recoverFrozenReels,
	withSpinTimeout,
} from './spinSafety';
import { playBookEvents } from './utils';

export { isLocalPlayRoute } from './localPlayRoute';
export { isLocalSpinInFlight } from './betRoundBusy.svelte';

const BONUS_KEYS = new Set([
	'BONUS',
	'bonus',
	'starpetal_awakening',
	'STARPETAL_AWAKENING',
	'starpetal_mystery',
	'STARPETAL_MYSTERY',
]);

const AUTO_SPIN_GAP_MS = 320;

const getBookVariant = (book: Bet & { events?: Bet['state'] }): string | undefined => {
	const events = book.events ?? book.state ?? [];
	const trigger = events.find((event) => event.type === 'freeSpinTrigger');
	if (!trigger || trigger.type !== 'freeSpinTrigger') return undefined;
	return trigger.bonusVariant ?? 'standard';
};

const filterBooksForMode = (pool: Bet[], modeKey: string): Bet[] => {
	if (modeKey === 'starpetal_awakening' || modeKey === 'STARPETAL_AWAKENING') {
		return pool.filter((book) => getBookVariant(book) === 'awakening');
	}
	if (modeKey === 'starpetal_mystery' || modeKey === 'STARPETAL_MYSTERY') {
		return pool.filter((book) => getBookVariant(book) !== undefined);
	}
	if (modeKey === 'bonus' || modeKey === 'BONUS') {
		return pool.filter((book) => {
			const variant = getBookVariant(book);
			return variant === undefined || variant === 'standard';
		});
	}
	return pool;
};

export async function pickLocalBook(): Promise<(Bet & { events?: Bet['state'] }) | null> {
	const modeKey = stateBet.activeBetModeKey;
	const useBonus = BONUS_KEYS.has(modeKey);
	const pool = useBonus ? await loadBonusBooks() : await loadBaseBooks();
	if (!pool.length) return null;

	const modePool = filterBooksForMode(pool, modeKey);
	const scopedPool = modePool.length > 0 ? modePool : pool;

	if (!useBonus) {
		const targetCategory = pickBaseSpinCategory();
		const categoryPool = scopedPool.filter(
			(book) => getBaseBookCategory(book) === targetCategory,
		);
		const candidates = categoryPool.length > 0 ? categoryPool : scopedPool;
		return candidates[randomInteger({ min: 0, max: candidates.length - 1 })];
	}

	return scopedPool[randomInteger({ min: 0, max: scopedPool.length - 1 })];
}

export const resetLocalSpinState = () => {
	setLocalSpinInFlight(false);
	setBetRoundBusy(false);
	stateSlots.isPreSpinning = false;
	prepareBoardForSpin();
};

let localAutoSpinRunning = false;
let localAutoSpinStartBalance = 0;

const roundBalance = (amount: number) => Math.round(amount * 100) / 100;

const getLocalWinAmount = (book: Bet & { events?: Bet['state'] }) => {
	if (stateBet.winBookEventAmount > 0) {
		return bookEventAmountToNormalisedAmount(stateBet.winBookEventAmount);
	}

	if (book.payoutMultiplier > 0) {
		return stateBet.wageredBetAmount * (book.payoutMultiplier / BOOK_AMOUNT_MULTIPLIER);
	}

	return 0;
};

export function initLocalPlayState() {
	stateMeta.betModeMeta = getStarpetalBetModeMeta();
	stateBet.balanceAmount = 1000;
	stateConfig.betAmountOptions = [...BET_AMOUNT_OPTIONS];
	stateConfig.betMenuOptions = [...BET_AMOUNT_OPTIONS];
	stateBet.betAmount = DEFAULT_BET;
	stateBet.wageredBetAmount = DEFAULT_BET;
	stateBet.activeBetModeKey = 'BASE';
}

const shouldSkipPreSpin = () =>
	(stateBet.isTurbo && (stateBet.autoSpinsCounter > 0 || localAutoSpinRunning)) ||
	stateBet.isSpaceHold;

export const canStartLocalSpin = () =>
	isLocalPlayRoute() && !isLocalSpinInFlight() && !stateBetRoundBusy.active;

export async function runLocalAutoSpinLoop(): Promise<void> {
	if (!isLocalPlayRoute()) return;
	if (localAutoSpinRunning) return;
	if (stateBet.autoSpinsCounter <= 0) return;

	localAutoSpinRunning = true;
	localAutoSpinStartBalance = stateBet.balanceAmount;
	stateBet.autoSpinsLoss = 0;

	try {
		while (stateBet.autoSpinsCounter > 0) {
			if (!stateBetDerived.isBetCostAvailable()) {
				stateBet.autoSpinsCounter = 0;
				stateModal.modal = { name: 'autoSpinMessage', message: 'insufficientFunds' };
				break;
			}

			if (stateBet.autoSpinsLossLimitAmount !== Infinity) {
				const loss =
					Math.round((localAutoSpinStartBalance - stateBet.balanceAmount) * 100) / 100;
				stateBet.autoSpinsLoss = loss;
				if (loss >= stateBet.autoSpinsLossLimitAmount) {
					stateBet.autoSpinsCounter = 0;
					stateModal.modal = { name: 'autoSpinMessage', message: 'lossLimitReached' };
					break;
				}
			}

			const played = await runLocalBook();
			if (!played) break;

			if (stateBet.autoSpinsSingleWinLimitAmount !== Infinity) {
				const win = bookEventAmountToNormalisedAmount(stateBet.winBookEventAmount);
				if (win >= stateBet.autoSpinsSingleWinLimitAmount) {
					stateBet.autoSpinsCounter = 0;
					stateModal.modal = { name: 'autoSpinMessage', message: 'singleWinLimitReached' };
					break;
				}
			}

			stateBet.autoSpinsCounter = Math.max(0, stateBet.autoSpinsCounter - 1);

			if (stateBet.autoSpinsCounter > 0) {
				await waitForTimeout(stateBet.isTurbo ? 80 : AUTO_SPIN_GAP_MS);
			}
		}
	} finally {
		localAutoSpinRunning = false;
	}
}

export async function runLocalBook(): Promise<boolean> {
	if (!isLocalPlayRoute()) return false;
	if (isLocalSpinInFlight() || stateBetRoundBusy.active) return false;

	setLocalSpinInFlight(true);
	setBetRoundBusy(true);

	try {
		if (!stateBetDerived.isBetCostAvailable()) {
			stateModal.modal = { name: 'autoSpinMessage', message: 'insufficientFunds' };
			return false;
		}

		const data = await pickLocalBook();
		if (!data) {
			console.error('[local play] No books available — check static/data/base_books.json');
			return false;
		}

		const bookEvents = data.events ?? data.state ?? [];
		const betCost = stateBetDerived.betCost();
		stateBet.wageredBetAmount = stateBet.betAmount;
		stateBet.winBookEventAmount = 0;
		stateBet.balanceAmount = roundBalance(stateBet.balanceAmount - betCost);

		if (!shouldSkipPreSpin()) {
			await stateGameDerived.enhancedBoard.preSpin({});
		}

		await withSpinTimeout(
			playBookEvents(sanitizeBookEvents(bookEvents)),
			BOOK_ROUND_TIMEOUT_MS,
			'local playBookEvents',
			recoverFrozenReels,
		);

		const winAmount = getLocalWinAmount(data);
		if (winAmount > 0) {
			stateBet.balanceAmount = roundBalance(stateBet.balanceAmount + winAmount);
		}

		eventEmitter.broadcast({ type: 'stopButtonEnable' });
		return true;
	} catch (error) {
		console.error('Spin failed:', error);
		abortFrozenSpin('local-spin');
		return false;
	} finally {
		setLocalSpinInFlight(false);
		setBetRoundBusy(false);
		stateSlots.isPreSpinning = false;
		if (BONUS_KEYS.has(stateBet.activeBetModeKey)) {
			stateBet.activeBetModeKey = 'BASE';
		}
	}
}