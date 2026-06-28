import { stateBet, stateConfig } from 'state-shared';
import { assetUrl } from '../config/assetUrl';

import { playBet } from '$game/utils';
import type { Bet } from '$game/typesBookEvent';
import { demoState } from './demoState.svelte';
import { pickBaseSpinCategory, getBaseBookCategory } from './odds';

/**
 * Dev-only offline harness for the refactor.
 *
 * Lets us drive the real SDK engine without an RGS connection so every later
 * migration phase is verifiable: visit /play, press the spin button, and a
 * random demo book is played through `playBet` exactly like production.
 */
export const isLocalPlayRoute = () =>
	typeof window !== 'undefined' && window.location.pathname.startsWith('/play');

// Max bet capped at $500 (Stake's limit). In production the bet ladder comes from the
// RGS authenticate response; this list is only for the offline /play route.
const DEMO_BET_OPTIONS = [0.2, 0.4, 0.6, 0.8, 1, 2, 5, 10, 20, 50, 100, 200, 500];

/**
 * Minimal stand-in for what <Authenticate> normally provides, so the UI/board
 * render and the spin button is enabled (isBetCostAvailable) without an RGS.
 */
export const initLocalDemoState = () => {
	stateBet.currency = 'USD';
	stateBet.balanceAmount = 1000;
	stateBet.betAmount = 1;
	stateBet.wageredBetAmount = 1;
	stateBet.activeBetModeKey = 'BASE';
	stateConfig.betAmountOptions = [...DEMO_BET_OPTIONS];
	stateConfig.betMenuOptions = [...DEMO_BET_OPTIONS];
	stateConfig.jurisdiction = {
		socialCasino: false,
		disabledFullscreen: false,
		disabledTurbo: false,
		disabledSuperTurbo: false,
		disabledAutoplay: false,
		disabledSlamstop: false,
		disabledBuyFeature: false,
		disabledSpacebar: false,
		displayNetPosition: false,
		displayRTP: false,
		displaySessionTimer: false,
		minimumRoundDuration: 0,
	};
};

// Starpetal demo books, served from static and lazy-loaded (kept out of the
// engine-init bundle the bridge pulls in). Base spins draw from base_books; bonus
// buys draw from bonus_books, filtered to the purchased feature.
type DemoBook = {
	events: Array<{ type?: string; bonusVariant?: string }>;
	payoutMultiplier?: number;
};

let baseBooksCache: DemoBook[] | null = null;
let bonusBooksCache: DemoBook[] | null = null;
// The static demo set has only a handful of bonus books per variant, so track the
// last one played and avoid replaying it back-to-back (production draws from the full
// math-SDK set, where repeats are vanishingly rare).
let lastBonusBook: DemoBook | null = null;

const loadBaseBooks = async () => {
	if (!baseBooksCache) {
		const res = await fetch(assetUrl('starpetal/data/base_books.json'));
		baseBooksCache = await res.json();
	}
	return baseBooksCache!;
};

const loadBonusBooks = async () => {
	if (!bonusBooksCache) {
		const res = await fetch(assetUrl('starpetal/data/bonus_books.json'));
		bonusBooksCache = await res.json();
	}
	return bonusBooksCache!;
};

// activeBetModeKey values set by the buy-bonus cards (betModeMeta `.mode` fields).
const BONUS_KEYS = new Set([
	'bonus',
	'BONUS',
	'starpetal_awakening',
	'STARPETAL_AWAKENING',
	'starpetal_mystery',
	'STARPETAL_MYSTERY',
]);

/** A bonus book's feature variant, read from its freeSpinTrigger event. */
const getBookVariant = (book: DemoBook): string | undefined => {
	const trigger = book.events?.find((event) => event.type === 'freeSpinTrigger');
	if (!trigger) return undefined;
	return trigger.bonusVariant ?? 'standard';
};

/** Restrict the bonus pool to the purchased feature, mirroring the pre-refactor
 *  local play: `bonus` → Starpetal Harvest (3-scatter standard), `starpetal_awakening`
 *  → Starpetal Awakening (4-scatter), `starpetal_mystery` → any bonus variant. */
const filterBonusBooksForMode = (pool: DemoBook[], modeKey: string): DemoBook[] => {
	if (modeKey === 'starpetal_awakening' || modeKey === 'STARPETAL_AWAKENING') {
		return pool.filter((book) => getBookVariant(book) === 'awakening');
	}
	if (modeKey === 'starpetal_mystery' || modeKey === 'STARPETAL_MYSTERY') {
		return pool.filter((book) => getBookVariant(book) !== undefined);
	}
	return pool.filter((book) => {
		const variant = getBookVariant(book);
		return variant === undefined || variant === 'standard';
	});
};

const pickBaseBook = (books: DemoBook[]): DemoBook => {
	const forceEvent =
		typeof window !== 'undefined' ? (window as { __forceEvent?: string }).__forceEvent : undefined;
	if (forceEvent) {
		const forced = books.filter((book) => book.events.some((event) => event.type === forceEvent));
		if (forced.length) return forced[Math.floor(Math.random() * forced.length)];
	}

	// Weighted draw so offline play matches the math: ~1/400 natural bonus, split
	// 70/20/10 across standard / awakening / mystery; otherwise a non-bonus spin.
	const category = pickBaseSpinCategory();
	const categoryPool = books.filter((book) => getBaseBookCategory(book) === category);
	const from = categoryPool.length ? categoryPool : books;
	return from[Math.floor(Math.random() * from.length)];
};

/** Play one random starpetal demo book through the real SDK engine (no RGS).
 *
 * Base spins play a random base book; a bonus buy (activeBetModeKey set by the
 * buy-bonus cards) plays a book of the purchased feature, then resets the mode to
 * BASE so the next spin is a normal one — mirroring the pre-refactor local play.
 *
 * Dev affordance: set `window.__forceEvent = '<bookEventType>'` to restrict the
 * base pool to books that contain that event (e.g. 'starfall'). */
export const runDemoBook = async () => {
	if (demoState.busy) return;
	demoState.busy = true;
	try {
		// Wager the current bet so wins scale to it (and respect the max-win cap);
		// without this the win is computed against the stale init wager.
		stateBet.wageredBetAmount = stateBet.betAmount;
		const modeKey = stateBet.activeBetModeKey;
		let book: DemoBook;

		if (BONUS_KEYS.has(modeKey)) {
			const pool = await loadBonusBooks();
			const modePool = filterBonusBooksForMode(pool, modeKey);
			let from = modePool.length ? modePool : pool;
			if (from.length > 1 && lastBonusBook) {
					// Don't replay the exact same bonus book twice in a row (tiny demo pool).
					const withoutLast = from.filter((candidate) => candidate !== lastBonusBook);
					if (withoutLast.length) from = withoutLast;
				}
				book = from[Math.floor(Math.random() * from.length)];
				lastBonusBook = book;
		} else {
			book = pickBaseBook(await loadBaseBooks());
		}

		await playBet({ ...book, state: book.events } as unknown as Bet);
	} finally {
		demoState.busy = false;
		// A bought bonus is a one-shot; return to the base game afterwards.
		if (BONUS_KEYS.has(stateBet.activeBetModeKey)) {
			stateBet.activeBetModeKey = 'BASE';
		}
	}
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let autoplayRunning = false;

/**
 * Offline autoplay — loops demo books while `autoSpinsCounter > 0`.
 *
 * The engine's autoplay is XState-machine-driven and assumes the RGS bet flow,
 * which the /play harness bypasses (it plays pre-baked books via runDemoBook), so
 * machine autoplay breaks offline. We drive it here instead. Stop = the spin/auto
 * button setting `autoSpinsCounter = 0`, which ends the loop.
 */
export const runDemoAutoplay = async () => {
	if (autoplayRunning) return;
	autoplayRunning = true;
	try {
		while (stateBet.autoSpinsCounter > 0 && isLocalPlayRoute()) {
			if (demoState.busy) {
				await sleep(120);
				continue;
			}
			await runDemoBook();
			if (stateBet.autoSpinsCounter !== Infinity) stateBet.autoSpinsCounter -= 1;
			await sleep(250);
		}
	} finally {
		autoplayRunning = false;
	}
};
