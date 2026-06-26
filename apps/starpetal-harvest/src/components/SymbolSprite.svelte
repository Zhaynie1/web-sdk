<script lang="ts">
	import { Sprite, type SpriteProps } from 'pixi-svelte';

	import { getSymbolInfo } from '../game/utils';
	import { SYMBOL_SIZE } from '../game/constants';
	import { SYMBOL_TINTS } from '../game/theme';
	import { onMount } from 'svelte';

	type Props = {
		x?: number;
		y?: number;
		symbolInfo: ReturnType<typeof getSymbolInfo>;
		symbolName?: string;
		oncomplete?: () => void;
	};

	const props: Props = $props();

	onMount(() => {
		props.oncomplete?.();
	});
</script>

<Sprite
	x={props.x}
	y={props.y}
	anchor={0.5}
	key={props.symbolInfo.assetKey}
	width={SYMBOL_SIZE * props.symbolInfo.sizeRatios.width}
	height={SYMBOL_SIZE * props.symbolInfo.sizeRatios.height}
	tint={props.symbolName ? (SYMBOL_TINTS[props.symbolName] ?? 0xffffff) : 0xffffff}
/>
