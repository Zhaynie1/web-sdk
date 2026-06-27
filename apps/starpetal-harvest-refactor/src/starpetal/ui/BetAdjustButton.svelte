<script lang="ts">
	import { Container, Graphics, Text } from 'pixi-svelte';
	import { Button } from 'components-pixi';
	import { stateBet, stateBetDerived, stateConfig } from 'state-shared';

	import { drawVineCircleButton } from './draw/drawVineButton';
	import { THEME } from '../config/theme';

	type Props = { direction: 'decrease' | 'increase'; x?: number; y?: number; size?: number; zIndex?: number };
	const props: Props = $props();
	const buttonSize = $derived(props.size ?? 56);
	const sizes = $derived({ width: buttonSize, height: buttonSize });
	const radius = $derived(buttonSize * 0.5);
	const fontSize = $derived(buttonSize * 0.46);
	const label = $derived(props.direction === 'decrease' ? '−' : '+');

	const options = $derived(stateConfig.betAmountOptions ?? []);
	const smallest = $derived(options[0]);
	const biggest = $derived(options[options.length - 1]);
	const disabled = $derived(
		props.direction === 'decrease' ? stateBet.betAmount === smallest : stateBet.betAmount === biggest,
	);

	const onpress = () => {
		if (props.direction === 'decrease') {
			const next = [...options].sort((a, b) => b - a).find((o) => o < stateBet.betAmount);
			stateBetDerived.setBetAmount(next ?? smallest);
		} else {
			const next = [...options].sort((a, b) => a - b).find((o) => o > stateBet.betAmount);
			stateBetDerived.setBetAmount(next ?? biggest);
		}
	};
</script>

<Button x={props.x} y={props.y} zIndex={props.zIndex} anchor={0.5} {sizes} {onpress} {disabled}>
	{#snippet children({ center, hovered })}
		<Container {...center}>
			<Graphics
				scale={hovered && !disabled ? 1.05 : 1}
				draw={(g) => drawVineCircleButton(g, radius, { disabled, hovered: hovered && !disabled })}
			/>
			<Text
				anchor={0.5}
				text={label}
				style={{
					fontFamily: 'proxima-nova, Impact, sans-serif',
					fontWeight: '900',
					fontSize,
					fill: disabled ? 0x888899 : THEME.gold,
					stroke: { color: THEME.bgDeep, width: 3 },
				}}
			/>
		</Container>
	{/snippet}
</Button>
