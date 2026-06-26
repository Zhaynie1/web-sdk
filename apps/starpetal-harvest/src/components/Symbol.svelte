<script lang="ts">
	import SymbolSpine from './SymbolSpine.svelte';
	import SymbolSprite from './SymbolSprite.svelte';
	import SymbolClusterGlow from './SymbolClusterGlow.svelte';
	import { getSymbolBackgroundInfo, getSymbolInfo } from '../game/utils';
	import type { SymbolState, RawSymbol } from '../game/types';

	type Props = {
		x?: number;
		y?: number;
		state: SymbolState;
		rawSymbol: RawSymbol;
		oncomplete?: () => void;
		loop?: boolean;
	};

	const props: Props = $props();
	const symbolInfo = $derived(getSymbolInfo({ rawSymbol: props.rawSymbol, state: props.state }));
	const isSprite = $derived(symbolInfo.type === 'sprite');
	const showClusterGlow = $derived(
		['clusterPreWin', 'win', 'postWinStatic'].includes(props.state) &&
			!['S'].includes(props.rawSymbol.name),
	);
	const hideSymbolSprite = $derived(props.state === 'explosion');
	const glowVariant = $derived(props.state === 'clusterPreWin' ? 'preWin' : 'win');
</script>

{#if showClusterGlow}
	<SymbolClusterGlow x={props.x} y={props.y} variant={glowVariant} />
{/if}

{#if isSprite && !hideSymbolSprite}
	<SymbolSprite
		{symbolInfo}
		symbolName={props.rawSymbol.name}
		x={props.x}
		y={props.y}
		oncomplete={props.oncomplete}
	/>
{:else if !isSprite || hideSymbolSprite}
	{@const symbolBackgroundInfo = getSymbolBackgroundInfo({
		rawSymbol: props.rawSymbol,
		state: props.state,
	})}
	<SymbolSpine
		loop={props.loop}
		{symbolInfo}
		{symbolBackgroundInfo}
		x={props.x}
		y={props.y}
		showWinFrame={props.state === 'win' && !['S', 'M'].includes(props.rawSymbol.name)}
		listener={{
			complete: props.oncomplete,
		}}
	/>
{/if}
