<script lang="ts">
	// Single render point for the starpetal on-board multiplier collection,
	// mounted above the board in Game.svelte. Both children position themselves
	// via the engine's BoardContainer, so this just groups them.
	import MultiplierBoard from './MultiplierBoard.svelte';
	import MultiplierTotal from './MultiplierTotal.svelte';
</script>

<MultiplierBoard />
<MultiplierTotal />
