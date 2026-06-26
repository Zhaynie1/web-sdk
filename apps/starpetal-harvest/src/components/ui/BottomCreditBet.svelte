<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { Container, Text } from 'pixi-svelte';
	import { stateBet, stateBetDerived, stateModal } from 'state-shared';
	import { bookEventAmountToCurrencyString, numberToCurrencyString } from 'utils-shared/amount';
	import { getContextEventEmitter } from 'utils-event-emitter';
	import { getContextXstate } from 'utils-xstate';
	import type { EmitterEventUi } from 'components-ui-pixi';

	import { getContext } from '../../game/context';
	import { socialLabels } from '../../game/socialWording';

	type Props = {
		x?: number;
		y?: number;
		labelFontSize?: number;
		valueFontSize?: number;
	};

	const props: Props = $props();
	const { eventEmitter } = getContextEventEmitter<EmitterEventUi>();
	const { stateXstateDerived } = getContextXstate();
	const context = getContext();

	const labelFontSize = $derived(Math.round(props.labelFontSize ?? 15));
	const valueFontSize = $derived(Math.round(props.valueFontSize ?? 22));
	const columnHalf = $derived(context.stateGameDerived.isFreeSpinsFeatureActive() ? 96 : 72);
	/** ~1/4 inch left nudge at 96 DPI */
	const creditX = $derived(-columnHalf - 24);
	const lineGap = 18;
	const posX = $derived(Math.round(props.x ?? 0));
	const posY = $derived(Math.round(props.y ?? 0));

	const balanceTween = new Tween(stateBet.balanceAmount);
	const creditValue = $derived(numberToCurrencyString(balanceTween.current));
	const betValue = $derived(numberToCurrencyString(stateBetDerived.betCost()));
	const betDisabled = $derived(!stateXstateDerived.isIdle());

	const featureWinAmount = $derived(
		context.stateGame.bonusTumbling && context.stateGame.liveTumbleWin > 0
			? context.stateGame.spinStartFeatureWin + context.stateGame.liveTumbleWin
			: Math.max(0, stateBet.winBookEventAmount - context.stateGame.featureWinOffset),
	);

	const featureWinLabel = $derived(bookEventAmountToCurrencyString(featureWinAmount));
	const showFeatureWin = $derived(context.stateGameDerived.isFreeSpinsFeatureActive());
	const creditLabel = $derived(socialLabels.credit());
	const betLabel = $derived(socialLabels.bet());

	const labelStyle = $derived({
		fontFamily: 'proxima-nova, system-ui, sans-serif',
		fontSize: labelFontSize,
		fontWeight: '600' as const,
		fill: 0xff9020,
		stroke: { color: 0x000000, width: 2 },
	});

	const valueStyle = $derived({
		fontFamily: 'proxima-nova, system-ui, sans-serif',
		fontSize: valueFontSize,
		fontWeight: '600' as const,
		fill: 0xffffff,
		stroke: { color: 0x000000, width: 2 },
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

<Container x={posX} y={posY}>
	<Text anchor={0.5} x={creditX} text={creditLabel} style={labelStyle} />
	<Text anchor={0.5} x={creditX} y={lineGap} text={creditValue} style={valueStyle} />

	{#if showFeatureWin}
		<Text anchor={0.5} text="WIN" style={labelStyle} />
		<Text anchor={0.5} y={lineGap} text={featureWinLabel} style={valueStyle} />
	{/if}

	<Container
		x={columnHalf}
		eventMode="static"
		cursor={betDisabled ? 'not-allowed' : 'pointer'}
		onpointerup={openBetMenu}
	>
		<Text anchor={0.5} text={betLabel} style={labelStyle} />
		<Text anchor={0.5} y={lineGap} text={betValue} style={valueStyle} />
	</Container>
</Container>