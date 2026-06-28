<script lang="ts" module>
	export type EmitterEventTumbleWinAmount =
		| { type: 'tumbleWinAmountShow' }
		| { type: 'tumbleWinAmountHide' }
		| { type: 'tumbleWinAmountReset' }
		| { type: 'tumbleWinAmountUpdate'; amount: number; animate: boolean };
</script>

<script lang="ts">
	import { Container, Graphics, Text } from 'pixi-svelte';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';

	import SilverText from '$starpetal/ui/SilverText.svelte';
	import TumbleWinAmountWrap from './TumbleWinAmountWrap.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';
	import { THEME } from '$starpetal/config/theme';
	import { drawVineWinPanel } from '$starpetal/ui/draw/drawVineWinPanel';
	import { createRafTween } from '$starpetal/game/state.svelte';

	// Starpetal tumble-win counter: a compact procedural vine plaque + silver text,
	// matching the original (the cluster sample used Frame_Tumble.png + a gold spine).
	const context = getContext();

	// Footprint roughly matches the old sample frame so it sits over the reels cleanly.
	const PANEL_W = SYMBOL_SIZE * 2.5;
	const PANEL_H = SYMBOL_SIZE * 1.0;
	const TITLE_SIZE = PANEL_H * 0.22;
	const AMOUNT_SIZE = PANEL_H * 0.26;
	// Crisp title text when the UI scales up on high-DPI / 4k displays.
	const TEXT_RESOLUTION = 3;

	const displayAmount = createRafTween(0);
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
				emitterEvent.animate ? { duration: 400 } : { duration: 0 },
			);
		},
	});
</script>

<TumbleWinAmountWrap {show}>
	<Container y={PANEL_H * 0.18}>
		<Graphics draw={(g) => drawVineWinPanel(g, PANEL_W, PANEL_H, { compact: true, glow: true })} />
		<Text
			anchor={0.5}
			resolution={TEXT_RESOLUTION}
			y={-PANEL_H * 0.26}
			text="TUMBLE WIN"
			style={{
				fontFamily: 'proxima-nova, Impact, sans-serif',
				fontSize: TITLE_SIZE,
				fontWeight: '900',
				fill: THEME.silver,
				stroke: { color: THEME.silverStroke, width: 3 },
				align: 'center',
				letterSpacing: 1,
			}}
		/>
		<SilverText
			anchor={0.5}
			y={PANEL_H * 0.1}
			maxWidth={PANEL_W * 0.8}
			targetFontSize={AMOUNT_SIZE}
			text={bookEventAmountToCurrencyString(displayAmount.current)}
		/>
	</Container>
</TumbleWinAmountWrap>
