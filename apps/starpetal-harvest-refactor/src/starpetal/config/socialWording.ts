import { stateUrlDerived } from 'state-shared';

/** True when the game is loaded in Stake social-casino mode (`?social=true`). */
export const isSocialMode = () => stateUrlDerived.social();

/** Player-facing labels that differ between real-money and social modes. */
export const socialLabels = {
	credit: () => (isSocialMode() ? 'COINS' : 'CREDIT'),
	bet: () => (isSocialMode() ? 'SPIN' : 'BET'),
	play: () => (isSocialMode() ? 'PLAY' : 'BUY'),
	placeWager: () => (isSocialMode() ? 'COME AND PLAY' : 'PLACE YOUR BET'),
	bonusFeatureSection: () => (isSocialMode() ? 'Bonus Feature' : 'Bonus Buy'),
	mysteryFeature: () => (isSocialMode() ? 'Mystery Feature' : 'Mystery Buy'),
	wagerNoun: () => (isSocialMode() ? 'play' : 'bet'),
	wagerVerb: () => (isSocialMode() ? 'play' : 'bet'),
};
