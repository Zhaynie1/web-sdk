<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { Container, Graphics } from 'pixi-svelte';
	import { stateBet, stateBetDerived, stateUi, stateModal, stateSound } from 'state-shared';
	import { bookEventAmountToNormalisedAmount } from 'utils-shared/amount';

	import { getContext } from '$game/context';
	import { drawBottomBarBackground } from './draw/drawBottomBar';
	import IconButton from './IconButton.svelte';
	import BetAdjustButton from './BetAdjustButton.svelte';
	import AmountCell from './AmountCell.svelte';
	import SpinButton from './SpinButton.svelte';
	import BonusBuyButton from './BonusBuyButton.svelte';
	import StarpetalMenu from './StarpetalMenu.svelte';

	// Bottom bar in the standardized UI space, pinned to the canvas bottom and spanning
	// the actual canvas width (cw). Landscape uses one row; portrait/stacked uses three
	// rows (amounts / spin / utility) so the controls don't overlap on narrow screens.
	const context = getContext();
	const main = $derived(context.stateLayoutDerived.mainLayoutStandard());
	const canvas = $derived(context.stateLayoutDerived.canvasSizes());

	const W = $derived(main.width);
	const H = $derived(main.height);
	const cw = $derived(canvas.width / main.scale); // full canvas width, std units
	const left = $derived(W / 2 - cw / 2); // canvas left edge, std units
	const px = (f: number) => left + cw * f; // x at fraction f across the canvas

	const isPortrait = $derived(context.stateLayoutDerived.isStacked());
	const BAR_H = $derived(isPortrait ? 400 : 178);
	const barCenterY = $derived(H - BAR_H * 0.5);

	// landscape: one row; portrait: three rows
	const lY = $derived(barCenterY);
	const pAmt = $derived(H - 320);
	const pSpin = $derived(H - 190);
	const pUtil = $derived(H - 60);
	const spinSize = $derived(isPortrait ? 130 : 150);

	const fmt = (n: number) => '$' + (n || 0).toFixed(2);
	const win = $derived(bookEventAmountToNormalisedAmount(stateBet.winBookEventAmount));

	// Icon reflects the real mute state; pressing opens the volume sliders directly.
	const muted = $derived(stateSound.volumeValueMaster === 0);

	// Buy-bonus button: disabled while a round is playing; when a feature is active
	// it toggles back to BASE, otherwise it opens the buy-bonus selection menu.
	const bonusDisabled = $derived(!context.stateXstateDerived.isIdle());
	const bonusActive = $derived(stateBetDerived.activeBetMode()?.type === 'activate');
</script>

<MainContainer standard alignVertical="bottom">
	<!-- vine bar panel, centred horizontally, spanning the full canvas width -->
	<Container x={W / 2} y={barCenterY}>
		<Graphics draw={(g) => drawBottomBarBackground(g, cw, BAR_H, false)} />
	</Container>

	<!-- menu / paytable / sound -->
	<IconButton
		icon="menu"
		x={isPortrait ? px(0.1) : px(0.035)}
		y={isPortrait ? pUtil : lY}
		size={96}
		onpress={() => (stateUi.menuOpen = true)}
	/>
	<IconButton
		icon="paytable"
		x={isPortrait ? px(0.26) : px(0.09)}
		y={isPortrait ? pUtil : lY}
		size={96}
		onpress={() => (stateModal.modal = { name: 'payTable' })}
	/>
	<IconButton
		icon={muted ? 'volumeMuted' : 'volume'}
		x={isPortrait ? px(0.42) : px(0.145)}
		y={isPortrait ? pUtil : lY}
		size={96}
		active={muted}
		onpress={() => (stateModal.modal = { name: 'settings' })}
	/>

	<!-- amounts -->
	<Container x={isPortrait ? px(0.2) : px(0.24)} y={isPortrait ? pAmt : lY}>
		<AmountCell label="BALANCE" value={fmt(stateBet.balanceAmount)} />
	</Container>
	<Container x={isPortrait ? px(0.5) : px(0.37)} y={isPortrait ? pAmt : lY}>
		<AmountCell label="WIN" value={fmt(win)} />
	</Container>
	<Container x={isPortrait ? px(0.8) : px(0.5)} y={isPortrait ? pAmt : lY}>
		<AmountCell label="BET" value={fmt(stateBet.betAmount)} />
	</Container>

	<!-- bet- / SPIN / bet+ -->
	<BetAdjustButton
		direction="decrease"
		x={isPortrait ? px(0.32) : px(0.605)}
		y={isPortrait ? pSpin : lY}
		size={84}
	/>
	<SpinButton x={isPortrait ? px(0.5) : px(0.66)} y={isPortrait ? pSpin : lY} size={spinSize} />
	<BetAdjustButton
		direction="increase"
		x={isPortrait ? px(0.68) : px(0.715)}
		y={isPortrait ? pSpin : lY}
		size={84}
	/>

	<!-- auto / turbo / buy bonus -->
	<IconButton
		icon="autospin"
		x={isPortrait ? px(0.58) : px(0.82)}
		y={isPortrait ? pUtil : lY}
		size={96}
		active={stateBetDerived.hasAutoBetCounter()}
		onpress={() =>
			stateBetDerived.hasAutoBetCounter()
				? (stateBet.autoSpinsCounter = 0)
				: (stateModal.modal = { name: 'autoSpin' })}
	/>
	<IconButton
		icon="turbo"
		x={isPortrait ? px(0.74) : px(0.88)}
		y={isPortrait ? pUtil : lY}
		size={96}
		active={stateBet.isTurbo}
		onpress={() => stateBetDerived.updateIsTurbo(!stateBet.isTurbo, { persistent: true })}
	/>
	<BonusBuyButton
		x={isPortrait ? px(0.9) : px(0.94)}
		y={isPortrait ? pUtil : lY}
		size={104}
		active={bonusActive}
		disabled={bonusDisabled}
		onpress={() =>
			bonusActive
				? (stateBet.activeBetModeKey = 'BASE')
				: (stateModal.modal = { name: 'buyBonus' })}
	/>
</MainContainer>

<StarpetalMenu />
