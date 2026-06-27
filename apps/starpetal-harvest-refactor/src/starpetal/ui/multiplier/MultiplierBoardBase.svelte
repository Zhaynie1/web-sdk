<script lang="ts">
	import { starpetalState } from '$starpetal/game/state.svelte';
	import MultiplierSymbol from './MultiplierSymbol.svelte';
</script>

{#each starpetalState.multiplierBoard as multiplierSymbols, reelIndex (reelIndex)}
	{#each multiplierSymbols as multiplierSymbol}
		{#if multiplierSymbol}
			<MultiplierSymbol {reelIndex} {multiplierSymbol} />
		{/if}
	{/each}
{/each}
