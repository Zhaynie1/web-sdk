<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { Container, Graphics } from 'pixi-svelte';
	import { stateBet, stateBetDerived, stateUi, stateModal } from 'state-shared';
	import { bookEventAmountToNormalisedAmount } from 'utils-shared/amount';

	import { getContext } from '$game/context';
	import { drawBottomBarBackground } from './draw/drawBottomBar';
	import IconButton from './IconButton.svelte';
	import BetAdjustButton from './BetAdjustButton.svelte';
	import AmountCell from './AmountCell.svelte';
	import SpinButton from './SpinButton.svelte';

	// Clean vine bottom bar in the standardized UI space (desktop 1920x1080, top-left
	// origin). Pinned to the actual canvas bottom (alignVertical) and spanning the
	// actual canvas width (cw = canvas / scale), so it flows on resize.
	const context = getContext();
	const main = $derived(context.stateLayoutDerived.mainLayoutStandard());
	const canvas = $derived(context.stateLayoutDerived.canvasSizes());

	const W = $derived(main.width);
	const H = $derived(main.height);
	const cw = $derived(canvas.width / main.scale); // full canvas width, std units
	const left = $derived(W / 2 - cw / 2); // canvas left edge, std units
	const px = (f: number) => left + cw * f; // x at fraction f across the canvas

	const BAR_H = 178;
	const rowY = $derived(H - BAR_H * 0.5); // H = canvas bottom (bottom-aligned)

	const fmt = (n: number) => '$' + (n || 0).toFixed(2);
	const win = $derived(bookEventAmountToNormalisedAmount(stateBet.winBookEventAmount));
	let muted = $state(false);
</script>

<MainContainer standard alignVertical="bottom">
	<!-- vine bar panel, centred horizontally, spanning the full canvas width -->
	<Container x={W / 2} y={rowY}>
		<Graphics draw={(g) => drawBottomBarBackground(g, cw, BAR_H, false)} />
	</Container>

	<!-- left: menu / paytable / sound -->
	<IconButton icon="menu" x={px(0.035)} y={rowY} size={96} onpress={() => (stateUi.menuOpen = true)} />
	<IconButton
		icon="paytable"
		x={px(0.09)}
		y={rowY}
		size={96}
		onpress={() => (stateModal.modal = { name: 'payTable' })}
	/>
	<IconButton
		icon={muted ? 'volumeMuted' : 'volume'}
		x={px(0.145)} y={rowY} size={96} active={muted}
		onpress={() => (muted = !muted)}
	/>

	<!-- amounts -->
	<Container x={px(0.24)} y={rowY}><AmountCell label="BALANCE" value={fmt(stateBet.balanceAmount)} /></Container>
	<Container x={px(0.37)} y={rowY}><AmountCell label="WIN" value={fmt(win)} /></Container>
	<Container x={px(0.5)} y={rowY}><AmountCell label="BET" value={fmt(stateBet.betAmount)} /></Container>

	<!-- centre: bet- / SPIN / bet+ -->
	<BetAdjustButton direction="decrease" x={px(0.605)} y={rowY} size={84} />
	<SpinButton x={px(0.66)} y={rowY} size={150} />
	<BetAdjustButton direction="increase" x={px(0.715)} y={rowY} size={84} />

	<!-- right: auto / turbo / buy bonus -->
	<IconButton
		icon="autospin"
		x={px(0.82)}
		y={rowY}
		size={96}
		active={stateBetDerived.hasAutoBetCounter()}
		onpress={() =>
			stateBetDerived.hasAutoBetCounter()
				? (stateBet.autoSpinsCounter = 0)
				: (stateModal.modal = { name: 'autoSpin' })}
	/>
	<IconButton
		icon="turbo"
		x={px(0.88)}
		y={rowY}
		size={96}
		active={stateBet.isTurbo}
		onpress={() => stateBetDerived.updateIsTurbo(!stateBet.isTurbo, { persistent: true })}
	/>
	<IconButton
		icon="bonusBuy" x={px(0.94)} y={rowY} size={104}
		onpress={() => context.eventEmitter.broadcast({ type: 'buyBonusConfirm' })}
	/>
</MainContainer>
