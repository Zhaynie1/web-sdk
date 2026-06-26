<script lang="ts">
	import { Container, Graphics, Text } from 'pixi-svelte';
	import { Button, type ButtonProps } from 'components-pixi';
	import { stateBet, stateMetaDerived } from 'state-shared';
	import { numberToCurrencyString } from 'utils-shared/amount';
	import { getContextEventEmitter } from 'utils-event-emitter';
	import { getContextXstate } from 'utils-xstate';
	import type { EmitterEventUi } from 'components-ui-pixi';

	import { socialLabels } from '../../game/socialWording';

	type Props = Partial<Omit<ButtonProps, 'children'>> & {
		width?: number;
		height?: number;
		onToggle?: () => void;
	};

	const props: Props = $props();
	const { eventEmitter } = getContextEventEmitter<EmitterEventUi>();
	const { stateXstateDerived } = getContextXstate();

	const width = $derived(props.width ?? 300);
	const height = $derived(props.height ?? 108);
	const sizes = $derived({ width, height });
	const disabled = $derived(!stateXstateDerived.isIdle());
	const regularBonus = $derived(
		stateMetaDerived.betModeMetaList().find((m) => m.type === 'buy' && m.mode === 'BONUS'),
	);
	const price = $derived(
		numberToCurrencyString(stateBet.betAmount * (regularBonus?.costMultiplier ?? 100)),
	);
	const playLabel = $derived(socialLabels.play());

	const onpress = () => {
		if (disabled) return;
		eventEmitter.broadcast({ type: 'soundPressGeneral' });
		props.onToggle?.();
	};
</script>

<Button {...props} {sizes} {disabled} {onpress}>
	{#snippet children({ center, hovered })}
		<Container {...center}>
			<Graphics
				draw={(g) => {
					g.clear();
					const hw = width / 2;
					const hh = height / 2;
					const r = 20;

					g.roundRect(-hw - 5, -hh - 5, width + 10, height + 10, r + 3);
					g.fill({ color: 0xffa830, alpha: hovered ? 1 : 0.95 });
					g.roundRect(-hw - 5, -hh - 5, width + 10, height + 10, r + 3);
					g.stroke({ color: 0xffe566, width: 3, alpha: 0.9 });

					g.roundRect(-hw, -hh, width, height, r);
					g.fill({ color: 0x5a1a9e, alpha: 0.98 });
					for (let i = 0; i < 12; i++) {
						const angle = (i / 12) * Math.PI * 2;
						g.moveTo(0, 0);
						g.lineTo(Math.cos(angle) * hw * 0.95, Math.sin(angle) * hh * 0.95);
						g.stroke({ color: 0x8a3fd4, width: 2, alpha: 0.35 });
					}
					g.roundRect(-hw, -hh, width, height, r);
					g.stroke({ color: 0xffc84a, width: 3, alpha: 0.85 });
				}}
			/>
			<Text
				anchor={{ x: 0.5, y: 0.5 }}
				y={-24}
				text={playLabel}
				style={{
					fontFamily: 'proxima-nova, Impact, sans-serif',
					fontSize: 30,
					fontWeight: '900',
					fill: 0xffc030,
					stroke: { color: 0x4a1800, width: 5 },
				}}
			/>
			<Text
				anchor={{ x: 0.5, y: 0.5 }}
				y={4}
				text="FREE SPINS"
				style={{
					fontFamily: 'proxima-nova, Impact, sans-serif',
					fontSize: 24,
					fontWeight: '900',
					fill: 0xffffff,
					stroke: { color: 0x1a4a8a, width: 4 },
				}}
			/>
			<Graphics
				y={36}
				draw={(g) => {
					g.clear();
					g.roundRect(-58, -15, 116, 30, 15);
					g.fill({ color: 0xe040c8, alpha: 0.98 });
					g.roundRect(-58, -15, 116, 30, 15);
					g.stroke({ color: 0x6ec8ff, width: 3, alpha: 0.9 });
				}}
			/>
			<Text
				anchor={{ x: 0.5, y: 0.5 }}
				y={36}
				text={price}
				style={{
					fontFamily: 'proxima-nova',
					fontSize: 17,
					fontWeight: '700',
					fill: 0xffffff,
				}}
			/>
		</Container>
	{/snippet}
</Button>