import { isSocialMode, socialLabels } from './socialWording';
import { MAX_WIN_AMOUNT_LABEL } from './theme';

export type GameRulesSection = {
	title: string;
	paragraphs: string[];
};

const buildGameRulesSections = (): GameRulesSection[] => {
	const social = isSocialMode();
	const wagerNoun = socialLabels.wagerNoun();
	const bonusFeatureSection = socialLabels.bonusFeatureSection();
	const mysteryFeature = socialLabels.mysteryFeature();

	return [
		{
			title: 'Overview',
			paragraphs: [
				social
					? 'Starpetal Harvest is a 7×7 cluster-win slot set in a twilight grove. Wins tumble and cascade until no new clusters remain.'
					: 'Starpetal Harvest is a 7×7 cluster-pay slot set in a twilight grove. Wins tumble and cascade until no new clusters remain.',
				'The theoretical expected return is 96.00%.',
			],
		},
		{
			title: 'How to Win',
			paragraphs: [
				social
					? 'All winning symbols win in blocks of at least 5 matching symbols connected horizontally or vertically.'
					: 'All paying symbols win in blocks of at least 5 matching symbols connected horizontally or vertically.',
				'After a win, winning symbols are removed and new symbols fall in. Tumbles continue until no new wins appear.',
				social
					? 'The Glowing Vine Wild substitutes for all winning symbols. Wilds do not substitute for SCATTER symbols.'
					: 'The Glowing Vine Wild substitutes for all paying symbols. Wilds do not substitute for SCATTER symbols.',
			],
		},
		{
			title: 'Multiplier Dewdrops',
			paragraphs: [
				'Multiplier Dewdrop symbols can land on the board during base game and applicable bonuses.',
				'When a tumble chain ends with a win, all active dewdrop values on the board are added together and multiply that tumble win.',
				'Dewdrop values use powers of two (2×, 4×, 8×, and higher).',
			],
		},
		{
			title: 'Base Game Features',
			paragraphs: [
				'Starfall may add wild vines or multiplier dewdrops to the board.',
				social
					? 'Bloom Link may place wild vines between high-winning symbols during an active tumble chain.'
					: 'Bloom Link may place wild vines between high-paying symbols during an active tumble chain.',
			],
		},
		{
			title: 'Free Spins',
			paragraphs: [
				'SCATTER symbols appear on all reels. Landing 3, 4, or 5 SCATTERS in base game triggers a bonus tier:',
				'3 SCATTERS — Starpetal Harvest: 10 free spins.',
				'4 SCATTERS — Starpetal Awakening: 12 free spins with underlying tile multipliers on winning cells (2×, 4×, 8× … up to 512×). No dewdrop multipliers during this feature.',
				'5 SCATTERS — Starpetal Mystery: 15 free spins. Every cell starts at 2×, dewdrop multipliers apply, and a 256× dewdrop is guaranteed to land on a winning tumble at least once during the feature.',
				'During free spins, 3 SCATTERS retrigger +8 spins and 4 SCATTERS retrigger +10 spins (up to 180 total). Starpetal Mystery retriggers are possible but extremely rare.',
			],
		},
		{
			title: bonusFeatureSection,
			paragraphs: social
				? [
						`Starpetal Harvest Feature (100× ${wagerNoun}) — awards the standard 10-spin harvest bonus.`,
						`Starpetal Awakening Feature (200× ${wagerNoun}) — awards the 12-spin awakening bonus with underlying tile multipliers.`,
						`${mysteryFeature} (1,000× ${wagerNoun}) — reveals Starpetal Harvest (60%), Starpetal Awakening (30%), or full Starpetal Mystery (10%).`,
						'Bonus feature modes use the same theoretical expected return as base play unless stated otherwise by the platform.',
					]
				: [
						'Starpetal Harvest Buy (100× bet) — awards the standard 10-spin harvest bonus.',
						'Starpetal Awakening Buy (200× bet) — awards the 12-spin awakening bonus with underlying tile multipliers.',
						'Mystery Buy (1,000× bet) — reveals Starpetal Harvest (60%), Starpetal Awakening (30%), or full Starpetal Mystery (10%).',
						'Bonus buy modes use the same theoretical expected return as base play unless stated otherwise by the platform.',
					],
		},
		{
			title: 'Maximum Win',
			paragraphs: [
				social
					? `The maximum win amount is ${MAX_WIN_AMOUNT_LABEL} the underlying ${wagerNoun} in all ${wagerNoun} modes.`
					: `The maximum win amount is ${MAX_WIN_AMOUNT_LABEL} the underlying bet in all bet modes.`,
			],
		},
		{
			title: 'General',
			paragraphs: [
				social
					? `Use the win table button to view symbol values at your current ${wagerNoun}. Use settings to adjust sound and other preferences.`
					: 'Use the paytable button to view symbol values at your current bet. Use settings to adjust sound and other preferences.',
			],
		},
		{
			title: 'Rules',
			paragraphs: [
				'Malfunction voids all wins and plays. A consistent internet connection is required. In the event of a disconnection, reload the game to finish any uncompleted rounds. The expected return is calculated over many plays. The game display is not representative of any physical device and is for illustrative purposes only. Winnings are settled according to the amount received from the Remote Game Server and not from events within the web browser. TM and © 2026 Stake Engine.',
			],
		},
	];
};

/** Player-facing game info (info modal). Pay/win values live on the paytable. */
export const getGameRulesSections = () => buildGameRulesSections();