import { isSocialMode, socialLabels } from './socialWording';

const buildBonusBuyCardCopy = () => {
	const mysteryFeature = socialLabels.mysteryFeature();

	return {
		bonus: {
			title: 'Starpetal Harvest',
			description: '10 free spins',
		},
		starpetal_awakening: {
			title: 'Starpetal Awakening Super Bonus',
			description: '12 free spins\nStarts with 18 underlying 2× tiles — tile multipliers only',
		},
		starpetal_mystery: {
			title: isSocialMode() ? mysteryFeature : 'Mystery Buy',
			description:
				'60% Starpetal Harvest · 30% Starpetal Awakening · 10% full Starpetal Mystery.\n\nStarpetal Mystery awards 15 free spins with every cell starting at 2×, regular multiplier dewdrops, and a guaranteed 256× hit during the feature.',
		},
	} satisfies Record<string, { title: string; description: string }>;
};

/** Bonus-buy card copy — single source for modal display text. */
export const getBonusBuyCardCopy = (mode: string) => {
	const copy = buildBonusBuyCardCopy();
	return copy[mode] ?? copy[mode.toLowerCase()];
};
