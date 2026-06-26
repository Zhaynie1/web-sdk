import _ from 'lodash';

import { stateBet } from 'state-shared';
import { checkIsMultipleRevealEvents } from 'utils-book';
import { createPrimaryMachines, createIntermediateMachines, createGameActor } from 'utils-xstate';

import type { Bet } from './typesBookEvent';
import { setBetRoundBusy } from './betRoundBusy.svelte';
import { abortFrozenSpin, prepareBoardForSpin } from './spinSafety';
import { playBet, convertTorResumableBet } from './utils';
import { stateGameDerived } from './stateGame.svelte';
import { stateXstateDerived } from './stateXstate';

const primaryMachines = createPrimaryMachines<Bet>({
	onResumeGameActive: (betToResume) => convertTorResumableBet(betToResume),
	onResumeGameInactive: (betToResume) => {
		const lastRevealEvent = _.findLast(
			betToResume.state,
			(bookEvent) => bookEvent?.type === 'reveal',
		);

		if (lastRevealEvent) stateGameDerived.enhancedBoard.settle(lastRevealEvent.board);
	},
	onNewGameStart: async () => {
		setBetRoundBusy(true);
		stateBet.winBookEventAmount = 0;
		if ((stateBet.isTurbo && stateXstateDerived.isAutoBetting()) || stateBet.isSpaceHold) return;
		await stateGameDerived.enhancedBoard.preSpin({});
	},
	onNewGameError: () => {
		prepareBoardForSpin();
		abortFrozenSpin('newGameError');
	},
	onPlayGame: async (bet) => await playBet(bet),
	checkIsBonusGame: (bet) => checkIsMultipleRevealEvents({ bookEvents: bet.state }),
});

const intermediateMachines = createIntermediateMachines(primaryMachines);

export const gameActor = createGameActor(intermediateMachines);