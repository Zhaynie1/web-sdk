import type { createXstate } from 'utils-xstate';

import { isLocalPlayRoute } from './localPlayRoute';

type XstateDerived = ReturnType<typeof createXstate>['stateXstateDerived'];

export const stateBetRoundBusy = $state({ active: false });

let betRoundActiveSince = 0;
let localSpinInFlight = false;

export const markBetRoundStarted = () => {
	betRoundActiveSince = Date.now();
};

export const markBetRoundEnded = () => {
	betRoundActiveSince = 0;
};

export const getBetRoundActiveSince = () => betRoundActiveSince;

export const setLocalSpinInFlight = (inFlight: boolean) => {
	localSpinInFlight = inFlight;
};

export const isLocalSpinInFlight = () => localSpinInFlight;

export const setBetRoundBusy = (busy: boolean) => {
	stateBetRoundBusy.active = busy;
	if (busy) markBetRoundStarted();
	else markBetRoundEnded();
};

export const isBetRoundBusy = (stateXstateDerived: XstateDerived) => {
	if (stateBetRoundBusy.active || localSpinInFlight) return true;
	if (isLocalPlayRoute()) return false;
	return !stateXstateDerived.isIdle();
};