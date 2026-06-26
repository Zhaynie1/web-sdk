<script lang="ts">
	import { Container, Graphics, Text } from 'pixi-svelte';
	import { Button, type ButtonProps } from 'components-pixi';
	import { OnHotkey } from 'components-shared';
	import { stateBetDerived } from 'state-shared';
	import StarpetalButtonBetProvider from './StarpetalButtonBetProvider.svelte';
	import { i18nDerived } from 'components-ui-pixi';

	import { drawVineCircleButton } from '../../game/drawVineButton';
	import { THEME } from '../../game/theme';

	type Props = Partial<Omit<ButtonProps, 'children'>> & {
		size?: number;
	};

	const { size: spinSizeProp, ...buttonProps } = $props();
	const spinSize = $derived(spinSizeProp ?? 96);
	const sizes = $derived({ width: spinSize, height: spinSize });
	const radius = $derived(spinSize * 0.5);
	const labelSize = $derived(spinSize * 0.24);
</script>

<StarpetalButtonBetProvider>
	{#snippet children({ key, onpress })}
		{@const isStop = ['stop_default', 'stop_disabled'].includes(key)}
		{@const disabled = !stateBetDerived.isBetCostAvailable() || key === 'spin_disabled'}
		<OnHotkey hotkey="Space" {disabled} {onpress} />
		<Button {...buttonProps} {sizes} {onpress} {disabled}>
			{#snippet children({ center, hovered })}
				<Container {...center}>
					<Graphics
						draw={(g) =>
							drawVineCircleButton(g, radius, {
								disabled,
								hovered: hovered && !disabled,
								glow: isStop && !disabled,
							})}
						scale={hovered && !disabled ? 1.03 : 1}
					/>
					<Text
						anchor={0.5}
						text={isStop ? i18nDerived.stop() : 'SPIN'}
						style={{
							align: 'center',
							fontFamily: 'proxima-nova, Impact, sans-serif',
							fontWeight: '900',
							fontSize: labelSize,
							fill: disabled ? 0x666678 : THEME.gold,
							stroke: { color: THEME.bgDeep, width: 4 },
						}}
					/>
				</Container>
			{/snippet}
		</Button>
	{/snippet}
</StarpetalButtonBetProvider>