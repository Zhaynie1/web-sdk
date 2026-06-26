<script lang="ts">
	import { Container, Graphics, Text } from 'pixi-svelte';
	import { Button, type ButtonProps } from 'components-pixi';
	import { stateBet, stateBetDerived, stateModal } from 'state-shared';
	import { getContextEventEmitter } from 'utils-event-emitter';
	import { getContextXstate } from 'utils-xstate';
	import { i18nDerived } from 'components-ui-pixi';
	import type { EmitterEventUi } from 'components-ui-pixi';

	import { drawVineCircleButton } from '../../game/drawVineButton';
	import { THEME } from '../../game/theme';

	type Props = Partial<Omit<ButtonProps, 'children'>> & {
		size?: number;
	};

	const props: Props = $props();
	const { eventEmitter } = getContextEventEmitter<EmitterEventUi>();
	const { stateXstateDerived } = getContextXstate();

	const buttonSize = $derived(props.size ?? 96);
	const sizes = $derived({ width: buttonSize, height: buttonSize });
	const radius = $derived(buttonSize * 0.5);
	const disabled = $derived(!stateXstateDerived.isIdle());
	const active = $derived(stateBetDerived.activeBetMode()?.type === 'activate');
	const labelLines = $derived(i18nDerived.buyBonus().split(' '));
	const fontSize = $derived(buttonSize * 0.155);
	const lineGap = $derived(fontSize * 1.05);

	const onpress = () => {
		if (disabled) return;
		eventEmitter.broadcast({ type: 'soundPressGeneral' });

		if (active) {
			stateBet.activeBetModeKey = 'BASE';
		} else {
			stateModal.modal = { name: 'buyBonus' };
		}
	};
</script>

<Button {...props} {sizes} {onpress} {disabled}>
	{#snippet children({ center, hovered })}
		<Container {...center}>
			<Graphics
				draw={(g) =>
					drawVineCircleButton(g, radius, {
						disabled,
						hovered: hovered && !disabled,
						glow: active,
					})}
				scale={hovered && !disabled ? 1.03 : 1}
			/>
			{#each labelLines as line, index}
				<Text
					anchor={0.5}
					y={(index - (labelLines.length - 1) * 0.5) * lineGap}
					text={line}
					style={{
						align: 'center',
						fontFamily: 'proxima-nova, Impact, sans-serif',
						fontWeight: '900',
						fontSize,
						fill: disabled ? 0x666678 : active ? THEME.vine : THEME.gold,
						stroke: { color: THEME.bgDeep, width: 3 },
					}}
				/>
			{/each}
		</Container>
	{/snippet}
</Button>