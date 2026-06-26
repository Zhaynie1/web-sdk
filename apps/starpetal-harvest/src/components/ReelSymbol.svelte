<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { backOut } from 'svelte/easing';

	import Symbol from './Symbol.svelte';
	import SymbolWrap from './SymbolWrap.svelte';
	import { CLUSTER_HIGHLIGHT } from '../game/constants';
	import { getSymbolInfo, getSymbolX } from '../game/utils';
	import type { ReelSymbol } from '../game/stateGame.svelte';

	type Props = {
		reelIndex: number;
		reelSymbol: ReelSymbol;
	};

	const props: Props = $props();
	const symbolInfo = $derived(
		getSymbolInfo({ rawSymbol: props.reelSymbol.rawSymbol, state: props.reelSymbol.symbolState }),
	);
	const scale = new Tween(1);

	$effect(() => {
		const state = props.reelSymbol.symbolState;
		if (state === 'clusterPreWin') {
			void (async () => {
				await scale.set(CLUSTER_HIGHLIGHT.popPeakScale, {
					duration: CLUSTER_HIGHLIGHT.popUpMs,
					easing: backOut,
				});
				await scale.set(CLUSTER_HIGHLIGHT.popRestScale, {
					duration: CLUSTER_HIGHLIGHT.popSettleMs,
				});
			})();
			return;
		}
		if (state === 'win' || state === 'postWinStatic') {
			void scale.set(1.1, { duration: 40, easing: backOut });
			return;
		}
		if (state !== 'explosion') {
			void scale.set(1, { duration: 50 });
		}
	});
</script>

<SymbolWrap
	x={getSymbolX(props.reelIndex)}
	y={props.reelSymbol.symbolY.current}
	scale={scale.current}
	animating={symbolInfo.type === 'spine' &&
		(props.reelSymbol.symbolState === 'land' ||
			props.reelSymbol.symbolState === 'win' ||
			props.reelSymbol.symbolState === 'explosion')}
>
	<Symbol
		state={props.reelSymbol.symbolState}
		rawSymbol={props.reelSymbol.rawSymbol}
		oncomplete={() => {
			if (props.reelSymbol.symbolState === 'win') props.reelSymbol.oncomplete();
			if (props.reelSymbol.symbolState === 'explosion') props.reelSymbol.oncomplete();
			if (props.reelSymbol.symbolState === 'land') props.reelSymbol.symbolState = 'static';
		}}
	/>
</SymbolWrap>