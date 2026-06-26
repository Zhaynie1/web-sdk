<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Container, Graphics } from 'pixi-svelte';
	import { Button, type ButtonProps } from 'components-pixi';
	import { UI_BASE_SIZE } from 'components-ui-pixi/src/constants';

	import { drawVineCircleButton } from '../../game/drawVineButton';
	import { drawGroveButtonIcon, type GroveButtonIcon } from '../../game/drawVineButtonIcons';

	type Props = Partial<Omit<ButtonProps, 'children'>> & {
		icon: GroveButtonIcon;
		onpress: () => void;
		size?: number;
		active?: boolean;
		glow?: boolean;
		overlay?: Snippet;
	};

	const {
		icon,
		onpress,
		size: sizeProp,
		active = false,
		glow = false,
		overlay,
		disabled = false,
		...buttonProps
	}: Props = $props();

	const buttonSize = $derived(sizeProp ?? UI_BASE_SIZE);
	const sizes = $derived({ width: buttonSize, height: buttonSize });
	const radius = $derived(buttonSize * 0.5);
	const iconOpts = $derived({ disabled, active });
	const frameGlow = $derived(glow || active);
</script>

<Button {...buttonProps} {sizes} {onpress} {disabled}>
	{#snippet children({ center, hovered })}
		<Container {...center}>
			<Graphics
				draw={(g) =>
					drawVineCircleButton(g, radius, {
						disabled,
						hovered: hovered && !disabled,
						glow: frameGlow,
					})}
				scale={hovered && !disabled ? 1.03 : 1}
			/>
			<Graphics draw={(g) => drawGroveButtonIcon(g, icon, radius, iconOpts)} />
			{@render overlay?.()}
		</Container>
	{/snippet}
</Button>