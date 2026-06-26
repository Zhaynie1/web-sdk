import _ from 'lodash';
import { stateBet } from 'state-shared';
import { createPlayBookUtils } from 'utils-book';
import { createGetEmptyPaddedBoard } from 'utils-slots';

import {
	SYMBOL_SIZE,
	REEL_PADDING,
	SYMBOL_INFO_MAP,
	BOARD_DIMENSIONS,
} from './constants';
import { eventEmitter } from './eventEmitter';
import type { Bet, BookEventOfType } from './typesBookEvent';
import { bookEventHandlerMap } from './bookEventHandlerMap';
import { sanitizeBookEvents } from './sanitizeBook';
import { setBetRoundBusy } from './betRoundBusy.svelte';
import { isLocalPlayRoute } from './localPlayRoute';
import {
	abortFrozenSpin,
	BOOK_ROUND_TIMEOUT_MS,
	recoverFrozenReels,
	withSpinTimeout,
} from './spinSafety';
import type { RawSymbol, SymbolState } from './types';

// general utils
export const { getEmptyBoard } = createGetEmptyPaddedBoard({ reelsDimensions: BOARD_DIMENSIONS });
export const { playBookEvent, playBookEvents } = createPlayBookUtils({ bookEventHandlerMap });

export const playBet = async (bet: Bet) => {
	if (isLocalPlayRoute()) {
		stateBet.wageredBetAmount = stateBet.betAmount;
	}
	setBetRoundBusy(true);
	stateBet.winBookEventAmount = 0;
	try {
		await withSpinTimeout(
			playBookEvents(sanitizeBookEvents(bet.state)),
			BOOK_ROUND_TIMEOUT_MS,
			'playBet',
			recoverFrozenReels,
		);
	} catch (error) {
		console.error('[starpetal-harvest] playBet failed:', error);
		abortFrozenSpin('playBet');
	} finally {
		stateBet.forceNormalSpinPacing = false;
		setBetRoundBusy(false);
	}
	eventEmitter.broadcast({ type: 'stopButtonEnable' });
};

// resume bet
const BOOK_EVENT_TYPES_TO_RESERVE_FOR_SNAPSHOT = [
	'updateGlobalMult',
	'freeSpinTrigger',
	'updateFreeSpin',
	'setTotalWin',
];

export const convertTorResumableBet = (betToResume: Bet) => {
	const resumingIndex = Number(betToResume.event);
	const bookEventsBeforeResume = betToResume.state.filter(
		(_, eventIndex) => eventIndex < resumingIndex,
	);
	const bookEventsAfterResume = betToResume.state.filter(
		(_, eventIndex) => eventIndex >= resumingIndex,
	);

	const bookEventToCreateSnapshot: BookEventOfType<'createBonusSnapshot'> = {
		index: 0,
		type: 'createBonusSnapshot',
		bookEvents: bookEventsBeforeResume.filter((bookEvent) =>
			BOOK_EVENT_TYPES_TO_RESERVE_FOR_SNAPSHOT.includes(bookEvent.type),
		),
	};

	const stateToResume = [bookEventToCreateSnapshot, ...bookEventsAfterResume];

	return { ...betToResume, state: stateToResume };
};

// other utils
export const getSymbolX = (reelIndex: number) => SYMBOL_SIZE * (reelIndex + REEL_PADDING);
export const getSymbolY = (symbolIndexOfBoard: number) => (symbolIndexOfBoard + 0.5) * SYMBOL_SIZE;

const ALLOWED_MULTIPLIERS = [2, 4, 8, 16, 32, 64, 128, 256, 512] as const;

const MULTIPLIER_ASSET_KEY: Record<number, keyof typeof SYMBOL_INFO_MAP> = {
	2: 'M_2',
	4: 'M_4',
	8: 'M_8',
	16: 'M_16',
	32: 'M_32',
	64: 'M_64',
	128: 'M_128',
	256: 'M_256',
	512: 'M_512',
	250: 'M_256',
};

export const normalizeMultiplier = (value: number | string | undefined): number | undefined => {
	if (value === undefined) return undefined;
	const num = typeof value === 'string' ? Number.parseInt(value, 10) : value;
	return Number.isFinite(num) ? num : undefined;
};

export const nearestAllowedMultiplier = (value: number): (typeof ALLOWED_MULTIPLIERS)[number] => {
	if ((ALLOWED_MULTIPLIERS as readonly number[]).includes(value)) {
		return value as (typeof ALLOWED_MULTIPLIERS)[number];
	}
	return ALLOWED_MULTIPLIERS.reduce((best, candidate) =>
		Math.abs(candidate - value) < Math.abs(best - value) ? candidate : best,
	);
};

export const getMultiplierSymbolKey = (
	multiplier: number | string | undefined,
): keyof typeof SYMBOL_INFO_MAP => {
	const normalized = normalizeMultiplier(multiplier);
	if (normalized === undefined) return 'M_2';
	const resolved = nearestAllowedMultiplier(normalized);
	return MULTIPLIER_ASSET_KEY[resolved] ?? 'M_2';
};

export const getSymbolKey = ({ rawSymbol }: { rawSymbol: RawSymbol }) => {
	if (rawSymbol.name === 'M') {
		return getMultiplierSymbolKey(rawSymbol.multiplier);
	}
	if (rawSymbol.multiplier !== undefined) {
		return `${rawSymbol.name}_${rawSymbol.multiplier}` as keyof typeof SYMBOL_INFO_MAP;
	}
	return rawSymbol.name as keyof typeof SYMBOL_INFO_MAP;
};

export const getSymbolInfo = ({
	rawSymbol,
	state,
}: {
	rawSymbol: RawSymbol;
	state: SymbolState;
}) => {
	const symbolKey = getSymbolKey({ rawSymbol });
	const symbolStates =
		SYMBOL_INFO_MAP[symbolKey] ??
		(rawSymbol.name === 'M' ? SYMBOL_INFO_MAP.M_2 : SYMBOL_INFO_MAP.L1);
	const resolvedState = state === 'clusterPreWin' ? 'static' : state;
	return symbolStates[resolvedState] ?? symbolStates.static;
};

export const getSymbolBackgroundInfo = ({
	rawSymbol,
	state,
}: {
	rawSymbol: RawSymbol;
	state: SymbolState;
}) => {
	// Dewdrops are sprite-only — no legacy stake multiplier spine plates.
	return null;
};
