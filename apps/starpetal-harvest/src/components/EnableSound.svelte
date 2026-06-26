<script lang="ts">
	import { onMount } from 'svelte';

	import { preloadStarpetalSfx } from '../game/starpetalSfx';

	onMount(() => {
		preloadStarpetalSfx();
	});
</script>