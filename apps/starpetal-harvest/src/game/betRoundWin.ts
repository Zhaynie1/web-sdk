import type { BookEvent } from './typesBookEvent';

const ROUND_WIN_EVENT_TYPES = new Set<BookEvent['type']>([
	'winInfo',
	'tumbleBoard',
	'updateTumbleWin',
	'setWin',
	'boardMultiplierInfo',
	'wincap',
	'freeSpinTrigger',
]);

/** Whether this reveal round includes a win/bonus before the next reveal. */
export const revealRoundHasWin = (bookEvents: BookEvent[], revealIndex: number) => {
	const nextRevealIndex = bookEvents.find(
		(event) => event.type === 'reveal' && event.index > revealIndex,
	)?.index;
	const bound = nextRevealIndex ?? Number.POSITIVE_INFINITY;

	return bookEvents.some(
		(event) =>
			event.index > revealIndex &&
			event.index < bound &&
			ROUND_WIN_EVENT_TYPES.has(event.type),
	);
};