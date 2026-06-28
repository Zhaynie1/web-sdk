import type { BetModeMeta } from 'state-shared/src/stateMeta.svelte';

import { isSocialMode, socialLabels } from './socialWording';
import { MAX_WIN_MULTIPLIER } from './theme';

/**
 * Starpetal bet-mode meta — the source the buy-bonus menu enumerates
 * (stateMetaDerived.betModeMetaList()). Replaces the engine's
 * DEFAULT_BET_MODE_META; wired in via game/context.ts through the bridge.
 *
 * `mode` keys must match config.betModes so RGS buys resolve. Social-aware copy
 * is resolved at call-time, so this is a getter (not a const).
 */
const buyAssets = {
	icon: '',
	dialogImage: '',
	dialogVolatility: '',
	volatility: '',
	button: '',
};

export const getStarpetalBetModeMeta = (): BetModeMeta => {
	const social = isSocialMode();
	const play = socialLabels.play();
	const placeWager = socialLabels.placeWager();
	const betLabel = socialLabels.bet();
	const mysteryFeature = socialLabels.mysteryFeature();
	const wagerNoun = socialLabels.wagerNoun();

	return {
		BASE: {
			mode: 'BASE',
			costMultiplier: 1,
			type: 'default',
			parent: '',
			children: '',
			assets: buyAssets,
			maxWin: MAX_WIN_MULTIPLIER,
			text: {
				title: 'Starpetal Harvest',
				dialog: social
					? 'Base game with cluster wins and tumbling wins.'
					: 'Base game with cluster pays and tumbling wins.',
				button: 'SPIN',
				betAmountLabel: betLabel,
				tickerIdle: 'SPIN TO PLAY',
				tickerSpin: 'GOOD LUCK',
			},
		},
		BONUS: {
			mode: 'bonus',
			costMultiplier: 100,
			type: 'buy',
			parent: '',
			children: '',
			assets: buyAssets,
			maxWin: MAX_WIN_MULTIPLIER,
			text: {
				title: 'Starpetal Harvest',
				dialog: social
					? 'Play the Starpetal Harvest bonus. 3 SCATTER symbols award 10 free spins.'
					: 'Buy the Starpetal Harvest bonus. 3 SCATTER symbols award 10 free spins.',
				description: '10 free spins',
				button: play,
				tickerIdle: placeWager,
				tickerSpin: 'BONUS ACTIVATED',
			},
		},
		STARPETAL_AWAKENING: {
			mode: 'starpetal_awakening',
			costMultiplier: 200,
			type: 'buy',
			parent: '',
			children: '',
			assets: buyAssets,
			maxWin: MAX_WIN_MULTIPLIER,
			text: {
				title: 'Starpetal Awakening Super Bonus',
				dialog: social
					? 'Play the Starpetal Awakening Super Bonus. 4 SCATTER symbols award 12 free spins. Starts with 18 underlying 2× tiles; winning tiles build tile multipliers (2×, 4×, 8× … up to 512×). No dewdrop multipliers.'
					: 'Buy the Starpetal Awakening Super Bonus. 4 SCATTER symbols award 12 free spins. Starts with 18 underlying 2× tiles; winning tiles build tile multipliers (2×, 4×, 8× … up to 512×). No dewdrop multipliers.',
				description: '12 free spins\n18 starting 2× tiles — underlying multis only',
				button: play,
				tickerIdle: placeWager,
				tickerSpin: 'AWAKENING ACTIVATED',
			},
		},
		STARPETAL_MYSTERY: {
			mode: 'starpetal_mystery',
			costMultiplier: 1000,
			type: 'buy',
			parent: '',
			children: '',
			assets: buyAssets,
			maxWin: MAX_WIN_MULTIPLIER,
			text: {
				title: mysteryFeature,
				dialog: social
					? `Starpetal ${mysteryFeature} (1,000× ${wagerNoun}). Each play reveals one of three bonuses — Starpetal Harvest, Starpetal Awakening, or the rare Starpetal Mystery. Starpetal Mystery awards 15 free spins with every cell starting at 2×, regular multiplier dewdrops, and a guaranteed 256× hit during the feature.`
					: 'Starpetal Mystery Buy (1,000× bet). Each purchase reveals one of three bonuses — Starpetal Harvest, Starpetal Awakening, or the rare Starpetal Mystery. Starpetal Mystery awards 15 free spins with every cell starting at 2×, regular multiplier dewdrops, and a guaranteed 256× hit during the feature.',
				description: social
					? `Each play awards Starpetal Harvest, Starpetal Awakening, or the rare full Starpetal Mystery.\n\nStarpetal Mystery: 15 spins, all cells start at 2×, dewdrops + guaranteed 256×.`
					: 'Each buy awards Starpetal Harvest, Starpetal Awakening, or the rare full Starpetal Mystery.\n\nStarpetal Mystery: 15 spins, all cells start at 2×, dewdrops + guaranteed 256×.',
				button: play,
				tickerIdle: placeWager,
				tickerSpin: 'MYSTERY ACTIVATED',
			},
		},
	};
};
