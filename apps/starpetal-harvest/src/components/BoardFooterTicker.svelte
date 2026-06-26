<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { Container, Text } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';
	import { stateBet } from 'state-shared';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';

	import BoardContainer from './BoardContainer.svelte';
	import { getBoardFooterTickerY } from '../game/layoutConstants';
	import { getContext } from '../game/context';

	const context = getContext();

	let tumbleAmount = $state(0);
	let tumbleVisible = $state(false);
	const winTween = new Tween(0);

	const displayAmount = $derived(
		tumbleVisible && tumbleAmount > 0 ? tumbleAmount : stateBet.winBookEventAmount,
	);
	const showWin = $derived(displayAmount > 0);
	const winLabel = $derived(bookEventAmountToCurrencyString(winTween.current));

	$effect(() => {
		winTween.set(displayAmount);
	});

	context.eventEmitter.subscribeOnMount({
		tumbleWinAmountShow: () => {
			tumbleVisible = true;
		},
		tumbleWinAmountHide: () => {
			tumbleVisible = false;
		},
		tumbleWinAmountReset: () => {
			tumbleAmount = 0;
			tumbleVisible = false;
		},
		tumbleWinAmountUpdate: (emitterEvent) => {
			tumbleAmount = emitterEvent.amount;
			tumbleVisible = true;
		},
	});
</script>

<BoardContainer>
	<Container x={0} y={getBoardFooterTickerY()}>
		<FadeContainer show={showWin}>
			<Text
				anchor={0.5}
				text={`WIN ${winLabel}`}
				style={{
					fontFamily: 'proxima-nova, Impact, sans-serif',
					fontSize: 32,
					fontWeight: '900',
					fill: 0xffd54a,
					stroke: { color: 0x4a2800, width: 5 },
					letterSpacing: 1,
				}}
			/>
		</FadeContainer>
	</Container>
</BoardContainer>