<script lang="ts">
	import { Container, Graphics } from 'pixi-svelte';
	import { Button } from 'components-pixi';

	import { drawVineCircleButton } from './draw/drawVineButton';
	import { drawGroveButtonIcon, type GroveButtonIcon } from './draw/drawVineButtonIcons';

	// Generic vine icon button: vine circle + procedural grove glyph.
	type Props = {
		icon: GroveButtonIcon;
		onpress: () => void;
		x?: number;
		y?: number;
		size?: number;
		zIndex?: number;
		active?: boolean;
		disabled?: boolean;
	};
	const props: Props = $props();
	const buttonSize = $derived(props.size ?? 64);
	const sizes = $derived({ width: buttonSize, height: buttonSize });
	const radius = $derived(buttonSize * 0.5);
</script>

<Button
	x={props.x}
	y={props.y}
	zIndex={props.zIndex}
	anchor={0.5}
	{sizes}
	onpress={props.onpress}
	disabled={props.disabled}
>
	{#snippet children({ center, hovered })}
		<Container {...center}>
			<Graphics
				scale={hovered && !props.disabled ? 1.04 : 1}
				draw={(g) =>
					drawVineCircleButton(g, radius, {
						disabled: props.disabled,
						hovered: hovered && !props.disabled,
						glow: props.active,
					})}
			/>
			<Graphics
				draw={(g) =>
					drawGroveButtonIcon(g, props.icon, radius, {
						disabled: props.disabled ?? false,
						active: props.active ?? false,
					})}
			/>
		</Container>
	{/snippet}
</Button>
