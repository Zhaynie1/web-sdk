<script lang="ts">
	import { Container, Graphics, Text } from 'pixi-svelte';
	import { Button } from 'components-pixi';
	import { OnHotkey } from 'components-shared';
	import { stateBetDerived } from 'state-shared';

	import BetProvider from './BetProvider.svelte';
	import { drawVineCircleButton } from './draw/drawVineButton';
	import { THEME } from '../config/theme';

	type Props = { x?: number; y?: number; size?: number; zIndex?: number };
	const props: Props = $props();
	const spinSize = $derived(props.size ?? 96);
	const sizes = $derived({ width: spinSize, height: spinSize });
	const radius = $derived(spinSize * 0.5);
	const labelSize = $derived(spinSize * 0.24);
</script>

<BetProvider>
	{#snippet children({ key, onpress })}
		{@const isStop = ['stop_default', 'stop_disabled'].includes(key)}
		{@const disabled = !stateBetDerived.isBetCostAvailable() || key === 'spin_disabled'}
		<OnHotkey hotkey="Space" {disabled} {onpress} />
		<Button x={props.x} y={props.y} zIndex={props.zIndex} anchor={0.5} {sizes} {onpress} {disabled}>
			{#snippet children({ center, hovered })}
				<Container {...center}>
					<Graphics
						scale={hovered && !disabled ? 1.03 : 1}
						draw={(g) =>
							drawVineCircleButton(g, radius, {
								disabled,
								hovered: hovered && !disabled,
								glow: isStop && !disabled,
							})}
					/>
					<Text
						anchor={0.5}
						text={isStop ? 'STOP' : 'SPIN'}
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
</BetProvider>
