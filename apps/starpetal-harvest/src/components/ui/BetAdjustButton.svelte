<script lang="ts">
	import { Container, Graphics, Text } from 'pixi-svelte';
	import { Button, type ButtonProps } from 'components-pixi';
	import { stateBet, stateBetDerived, stateConfig } from 'state-shared';
	import { getContext } from '../../game/context';
	import { drawVineCircleButton } from '../../game/drawVineButton';
	import { THEME } from '../../game/theme';

	type Props = Partial<Omit<ButtonProps, 'children'>> & {
		direction: 'decrease' | 'increase';
		size?: number;
	};

	const { direction, size: sizeProp, ...buttonProps }: Props = $props();
	const buttonSize = $derived(sizeProp ?? 56);
	const context = getContext();
	const sizes = $derived({ width: buttonSize, height: buttonSize });
	const label = $derived(direction === 'decrease' ? '−' : '+');

	const smallest = $derived(stateConfig.betAmountOptions[0]);
	const biggest = $derived(stateConfig.betAmountOptions[stateConfig.betAmountOptions.length - 1]);
	const disabled = $derived(
		!context.stateXstateDerived.isIdle() ||
			(direction === 'decrease'
				? stateBet.betAmount === smallest
				: stateBet.betAmount === biggest),
	);

	const onpress = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });

		if (direction === 'decrease') {
			const nextSmaller = [...stateConfig.betAmountOptions]
				.sort((a, b) => b - a)
				.find((option) => option < stateBet.betAmount);
			stateBetDerived.setBetAmount(nextSmaller || smallest);
		} else {
			const nextBigger = [...stateConfig.betAmountOptions]
				.sort((a, b) => a - b)
				.find((option) => option > stateBet.betAmount);
			stateBetDerived.setBetAmount(nextBigger || biggest);
		}
	};

	const radius = $derived(buttonSize * 0.5);
	const fontSize = $derived(buttonSize * 0.46);
</script>

<Button {...buttonProps} {sizes} {onpress} {disabled}>
	{#snippet children({ center, hovered })}
		<Container {...center}>
			<Graphics
				draw={(g) =>
					drawVineCircleButton(g, radius, {
						disabled,
						hovered: hovered && !disabled,
					})}
				scale={hovered && !disabled ? 1.05 : 1}
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