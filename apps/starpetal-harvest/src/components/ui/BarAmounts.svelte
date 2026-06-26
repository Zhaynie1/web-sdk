<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { Container } from 'pixi-svelte';
	import { stateBet, stateBetDerived, stateModal } from 'state-shared';
	import { bookEventAmountToCurrencyString, numberToCurrencyString } from 'utils-shared/amount';
	import { getContextEventEmitter } from 'utils-event-emitter';
	import { getContextXstate } from 'utils-xstate';
	import type { EmitterEventUi } from 'components-ui-pixi';
	import { i18nDerived } from 'components-ui-pixi';

	import { getContext } from '../../game/context';
	import { getAmountCellWidth } from '../../game/layoutConstants';
	import { socialLabels } from '../../game/socialWording';
	import BarAmountCell from './BarAmountCell.svelte';

	type Props = {
		minCellWidth?: number;
		maxCellWidth?: number;
		cellWidth?: number;
		cellHeight?: number;
		gap?: number;
		/** Per-cell horizontal nudge, e.g. { credit: -20, bet: 20 } */
		cellNudge?: Partial<Record<'credit' | 'win' | 'bet', number>>;
	};

	const props: Props = $props();
	const { eventEmitter } = getContextEventEmitter<EmitterEventUi>();
	const { stateXstateDerived } = getContextXstate();
	const context = getContext();

	const minCellWidth = $derived(props.minCellWidth ?? props.cellWidth ?? 108);
	const maxCellWidth = $derived(props.maxCellWidth ?? minCellWidth * 2.25);
	const cellHeight = $derived(props.cellHeight ?? 52);
	const gap = $derived(props.gap ?? 10);

	const balanceTween = new Tween(stateBet.balanceAmount);
	const creditLabel = $derived(socialLabels.credit());
	const betLabel = $derived(socialLabels.bet());
	const creditValue = $derived(numberToCurrencyString(balanceTween.current));
	const betValue = $derived(numberToCurrencyString(stateBetDerived.betCost()));
	const betDisabled = $derived(!stateXstateDerived.isIdle());

	const featureWinAmount = $derived(
		context.stateGame.bonusTumbling && context.stateGame.liveTumbleWin > 0
			? context.stateGame.spinStartFeatureWin + context.stateGame.liveTumbleWin
			: Math.max(0, stateBet.winBookEventAmount - context.stateGame.featureWinOffset),
	);

	const showFeatureWin = $derived(context.stateGameDerived.isFreeSpinsFeatureActive());
	const winLabel = $derived(i18nDerived.win());
	const winValue = $derived(bookEventAmountToCurrencyString(featureWinAmount));

	const creditWidth = $derived(
		getAmountCellWidth(creditValue, minCellWidth, cellHeight, maxCellWidth),
	);
	const betWidth = $derived(
		getAmountCellWidth(betValue, minCellWidth, cellHeight, maxCellWidth),
	);
	const winWidth = $derived(
		getAmountCellWidth(winValue, minCellWidth, cellHeight, maxCellWidth),
	);

	type AmountCellLayout = {
		key: string;
		label: string;
		value: string;
		width: number;
		interactive?: boolean;
	};

	const cells = $derived<AmountCellLayout[]>(
		showFeatureWin
			? [
					{ key: 'credit', label: creditLabel, value: creditValue, width: creditWidth },
					{ key: 'win', label: winLabel, value: winValue, width: winWidth },
					{
						key: 'bet',
						label: betLabel,
						value: betValue,
						width: betWidth,
						interactive: true,
					},
				]
			: [
					{ key: 'credit', label: creditLabel, value: creditValue, width: creditWidth },
					{
						key: 'bet',
						label: betLabel,
						value: betValue,
						width: betWidth,
						interactive: true,
					},
				],
	);

	const totalWidth = $derived(
		cells.reduce((sum, cell) => sum + cell.width, 0) + gap * Math.max(0, cells.length - 1),
	);

	const cellOffsets = $derived.by(() => {
		let x = 0;
		return cells.map((cell) => {
			const centerX = x + cell.width * 0.5;
			x += cell.width + gap;
			return centerX;
		});
	});

	$effect(() => {
		balanceTween.set(stateBet.balanceAmount);
	});

	const openBetMenu = () => {
		if (betDisabled) return;
		eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateModal.modal = { name: 'betAmountMenu' };
	};
</script>

<Container x={-totalWidth * 0.5}>
	{#each cells as cell, index (cell.key)}
		<Container x={cellOffsets[index] + (props.cellNudge?.[cell.key as 'credit' | 'win' | 'bet'] ?? 0)}>
			<BarAmountCell
				label={cell.label}
				value={cell.value}
				width={cell.width}
				height={cellHeight}
				interactive={cell.interactive}
				disabled={cell.interactive ? betDisabled : false}
				onpress={cell.interactive ? openBetMenu : undefined}
			/>
		</Container>
	{/each}
</Container>