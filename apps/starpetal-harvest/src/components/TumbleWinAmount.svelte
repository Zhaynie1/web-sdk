<script lang="ts" module>
	export type EmitterEventTumbleWinAmount =
		| { type: 'tumbleWinAmountShow' }
		| { type: 'tumbleWinAmountHide' }
		| { type: 'tumbleWinAmountReset' }
		| { type: 'tumbleWinAmountUpdate'; amount: number; animate: boolean };
</script>

<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { ResponsiveBitmapText } from 'components-pixi';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';

	import TumbleWinAmountWrap from './TumbleWinAmountWrap.svelte';
	import WinFrameDisplay from './WinFrameDisplay.svelte';
	import { getContext } from '../game/context';
	import { TUMBLE_WIN_FRAME_WIDTH } from '../game/layoutConstants';
	import { getWinFrameMetrics } from '../game/winFrameLayout';

	const context = getContext();
	const showTumblePanel = $derived(!context.stateLayoutDerived.isStacked());
	const frameWidth = TUMBLE_WIN_FRAME_WIDTH;
	const frameMetrics = getWinFrameMetrics(frameWidth, 'compact');
	const displayAmount = new Tween(0);

	let show = $state(false);

	context.eventEmitter.subscribeOnMount({
		tumbleWinAmountShow: () => (show = true),
		tumbleWinAmountHide: () => (show = false),
		tumbleWinAmountReset: () => {
			void displayAmount.set(0, { duration: 0 });
		},
		tumbleWinAmountUpdate: async (emitterEvent) => {
			await displayAmount.set(
				emitterEvent.amount,
				emitterEvent.animate ? { duration: 400 } : undefined,
			);
		},
	});
</script>

{#if showTumblePanel}
	<TumbleWinAmountWrap {show}>
		<WinFrameDisplay title="TUMBLE WIN" layout="compact" compactBorder {frameWidth}>
			<ResponsiveBitmapText
				anchor={0.5}
				maxWidth={frameMetrics.amountMaxWidth}
				text={bookEventAmountToCurrencyString(displayAmount.current)}
				style={{
					fontFamily: 'silver',
					fontSize: frameMetrics.amountFontSize,
					align: 'center',
					fontWeight: 'bold',
					letterSpacing: 0,
				}}
			/>
		</WinFrameDisplay>
	</TumbleWinAmountWrap>
{/if}