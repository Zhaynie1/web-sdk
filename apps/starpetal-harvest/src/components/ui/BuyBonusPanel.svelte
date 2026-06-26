<script lang="ts">
	import { Container, Graphics, Text } from 'pixi-svelte';
	import { Button } from 'components-pixi';
	import { stateBet, stateMetaDerived } from 'state-shared';
	import { numberToCurrencyString } from 'utils-shared/amount';
	import { getContextEventEmitter } from 'utils-event-emitter';
	import { getContextXstate } from 'utils-xstate';
	import type { EmitterEventUi } from 'components-ui-pixi';

	type Props = {
		x?: number;
		y?: number;
		width?: number;
		height?: number;
		open?: boolean;
		onclose?: () => void;
	};

	const props: Props = $props();
	const { eventEmitter } = getContextEventEmitter<EmitterEventUi>();
	const { stateXstateDerived } = getContextXstate();

	const width = $derived(props.width ?? 280);
	const height = $derived(props.height ?? 300);
	const disabled = $derived(!stateXstateDerived.isIdle());

	const buyModes = $derived(
		stateMetaDerived.betModeMetaList().filter((item) => item.type === 'buy'),
	);

	const buyMode = (modeKey: string) => {
		if (disabled) return;
		const mode = buyModes.find((m) => m.mode === modeKey);
		if (!mode) return;
		if (stateBet.balanceAmount < stateBet.betAmount * mode.costMultiplier) return;

		eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateBet.activeBetModeKey = mode.mode;
		eventEmitter.broadcast({ type: 'bet' });
		props.onclose?.();
	};
</script>

<Container x={props.x} y={props.y} eventMode={props.open ? 'static' : 'none'}>
	<Graphics
		draw={(g) => {
			g.clear();
			const hw = width / 2;
			const hh = height / 2;
			g.roundRect(-hw, -hh, width, height, 14);
			g.fill({ color: 0x2a1848, alpha: props.open ? 0.55 : 0.3 });
			g.roundRect(-hw, -hh, width, height, 14);
			g.stroke({ color: 0xff5ec8, width: 4, alpha: 0.75 });
			g.moveTo(-hw + 20, -hh);
			g.lineTo(0, -hh - 10);
			g.lineTo(hw - 20, -hh);
			g.stroke({ color: 0xff5ec8, width: 3, alpha: 0.75 });
			g.moveTo(-hw + 20, hh);
			g.lineTo(0, hh + 10);
			g.lineTo(hw - 20, hh);
			g.stroke({ color: 0xff5ec8, width: 3, alpha: 0.75 });
		}}
	/>

	{#if props.open}
		{#each buyModes as mode, index}
			{@const cardY = -height * 0.28 + index * (height * 0.38)}
			{@const price = numberToCurrencyString(stateBet.betAmount * mode.costMultiplier)}
			{@const canBuy =
				stateBet.betAmount > 0 && stateBet.balanceAmount >= stateBet.betAmount * mode.costMultiplier}
			<Button
				anchor={0.5}
				y={cardY}
				sizes={{ width: width - 36, height: height * 0.3 }}
				disabled={disabled || !canBuy}
				onpress={() => buyMode(mode.mode)}
			>
				{#snippet children({ center, hovered })}
					<Container {...center}>
						<Graphics
							draw={(g) => {
								g.clear();
								const cw = (width - 36) / 2;
								const ch = (height * 0.3) / 2;
								g.roundRect(-cw, -ch, width - 36, height * 0.3, 12);
								g.fill({ color: 0x4a2088, alpha: hovered ? 0.95 : 0.85 });
								g.roundRect(-cw, -ch, width - 36, height * 0.3, 12);
								g.stroke({ color: 0xffc84a, width: 2, alpha: 0.8 });
							}}
						/>
						<Text
							anchor={{ x: 0.5, y: 0.5 }}
							y={-14}
							text={mode.text.title}
							style={{
								fontFamily: 'proxima-nova, Impact, sans-serif',
								fontSize: 20,
								fontWeight: '900',
								fill: 0xffffff,
								stroke: { color: 0x1a4a8a, width: 3 },
							}}
						/>
						<Text
							anchor={{ x: 0.5, y: 0.5 }}
							y={14}
							text={price}
							style={{
								fontFamily: 'proxima-nova',
								fontSize: 16,
								fontWeight: '700',
								fill: 0xffd87a,
							}}
						/>
					</Container>
				{/snippet}
			</Button>
		{/each}
	{/if}
</Container>