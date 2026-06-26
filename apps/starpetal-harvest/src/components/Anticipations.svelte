<script lang="ts">
	import { getContext } from '../game/context';
	import Anticipation from './Anticipation.svelte';

	const context = getContext();
</script>

{#each context.stateGame.board as reel, reelIndex (reelIndex)}
	{#if reel.reelState.anticipating || context.stateGame.scatterAnticipationHold[reelIndex]}
		<Anticipation
			{reel}
			active={reel.reelState.anticipating}
			retained={context.stateGame.scatterAnticipationHold[reelIndex]}
		/>
	{/if}
{/each}