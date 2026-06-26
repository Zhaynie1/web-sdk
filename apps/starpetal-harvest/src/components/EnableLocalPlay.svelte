<script lang="ts">
	import { onMount } from 'svelte';

	import { initLocalPlayState, isLocalPlayRoute, resetLocalSpinState } from '../game/localPlay';
	import { loadBaseBooks, loadBonusBooks } from '../game/localBooks.svelte';

	const isLocalPlay = isLocalPlayRoute();

	onMount(() => {
		if (!isLocalPlay) return;

		resetLocalSpinState();
		initLocalPlayState();
		loadBaseBooks();
		loadBonusBooks();
	});

	$effect(() => {
		if (isLocalPlay) {
			loadBaseBooks();
			loadBonusBooks();
		}
	});
</script>