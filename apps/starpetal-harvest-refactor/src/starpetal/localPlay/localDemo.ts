import { stateBet, stateConfig } from 'state-shared';

import { playBet } from '$game/utils';
import type { Bet } from '$game/typesBookEvent';
import { demoState } from './demoState.svelte';

/**
 * Dev-only offline harness for the refactor.
 *
 * Lets us drive the real SDK engine without an RGS connection so every later
 * migration phase is verifiable: visit /play, press the spin button, and a
 * random demo book is played through `playBet` exactly like production.
 */
export const isLocalPlayRoute = () =>
	typeof window !== 'undefined' && window.location.pathname.startsWith('/play');

const DEMO_BET_OPTIONS = [0.2, 0.4, 0.6, 0.8, 1, 2, 5, 10, 20, 50, 100];

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
// engine-init bundle the bridge pulls in).
let booksCache: Array<{ events: unknown[] }> | null = null;
const loadBooks = async () => {
	if (!booksCache) {
		const res = await fetch('/starpetal/data/base_books.json');
		booksCache = await res.json();
	}
	return booksCache!;
};

/** Play one random starpetal demo book through the real SDK engine (no RGS).
 *
 * Dev affordance: set `window.__forceEvent = '<bookEventType>'` to restrict the
 * pool to books that contain that event (e.g. 'starfall'), so rare features can
 * be exercised on demand during verification. Unset/no-match falls back to the
 * full pool. */
export const runDemoBook = async () => {
	if (demoState.busy) return;
	demoState.busy = true;
	try {
		const books = await loadBooks();
		const forceEvent =
			typeof window !== 'undefined' ? (window as { __forceEvent?: string }).__forceEvent : undefined;
		const pool = forceEvent
			? books.filter((b) => (b.events as Array<{ type?: string }>).some((e) => e.type === forceEvent))
			: books;
		const from = pool.length ? pool : books;
		const book = from[Math.floor(Math.random() * from.length)];
		await playBet({ ...book, state: book.events } as unknown as Bet);
	} finally {
		demoState.busy = false;
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
