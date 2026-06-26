<script lang="ts" module>
	import ClusterWinAmount, { type RawWin, type Win } from './ClusterWinAmount.svelte';

	export type EmitterEventClusterWinAmounts = {
		type: 'showClusterWinAmounts';
		wins: RawWin[];
	};
</script>

<script lang="ts">
	import { waitForResolve, waitForTimeout } from 'utils-shared/wait';

	import { CLUSTER_HIGHLIGHT } from '../game/constants';
	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';

	const context = getContext();

	let wins: Win[] = $state([]);

	context.eventEmitter.subscribeOnMount({
		showClusterWinAmounts: async (emitterEvent) => {
			wins = emitterEvent.wins.map((rawWin) => ({ ...rawWin, oncomplete: () => {} }));
			const gerPromises = () =>
				wins.map(async (win) => {
					await Promise.race([
						waitForResolve((resolve) => (win.oncomplete = resolve)),
						waitForTimeout(CLUSTER_HIGHLIGHT.winAmountTimeoutMs),
					]);
				});
			await Promise.all(gerPromises());
			wins = [];
		},
	});
</script>

<BoardContainer>
	{#each wins as win}
		<ClusterWinAmount {win} />
	{/each}
</BoardContainer>
