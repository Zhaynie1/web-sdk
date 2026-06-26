<script lang="ts" module>
	export type EmitterEventTransition = { type: 'transition' };
</script>

<script lang="ts">
	import { waitForResolve, waitForTimeout } from 'utils-shared/wait';

	import TransitionAnimation from './TransitionAnimation.svelte';
	import { getContext } from '../game/context';

	const context = getContext();

	let transitioning = $state(false);
	let oncomplete = $state(() => {});

	context.eventEmitter.subscribeOnMount({
		transition: async () => {
			transitioning = true;
			await Promise.race([
				waitForResolve((resolve) => (oncomplete = resolve)),
				waitForTimeout(2000),
			]);
		},
	});
</script>

{#if transitioning}
	<TransitionAnimation
		oncomplete={() => {
			oncomplete();
			transitioning = false;
		}}
	/>
{/if}