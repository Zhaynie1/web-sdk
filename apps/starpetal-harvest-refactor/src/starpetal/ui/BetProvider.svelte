<script lang="ts" module>
	export type BetKey = 'spin_default' | 'spin_disabled' | 'stop_default' | 'stop_disabled';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	import { stateBet, stateBetDerived } from 'state-shared';

	import { getContext } from '$game/context';
	import { isLocalPlayRoute } from '../localPlay/localDemo';
	import { demoState } from '../localPlay/demoState.svelte';

	// Clean bet logic on the cluster engine: production reads the xstate machine;
	// the offline /play route reads demoState.busy (no betRoundBusy fork hack).
	type Props = { children: Snippet<[{ key: BetKey; onpress: () => void }]> };
	const props: Props = $props();
	const context = getContext();

	const roundBusy = $derived.by(() => {
		void demoState.busy;
		void context.stateXstate.value;
		return isLocalPlayRoute() ? demoState.busy : !context.stateXstateDerived.isIdle();
	});

	const onpress = () => {
		const autospin = stateBetDerived.hasAutoBetCounter();
		if (roundBusy && !autospin) return;
		context.eventEmitter.broadcast({ type: 'soundPressBet' });
		if (!roundBusy) {
			context.eventEmitter.broadcast({ type: 'bet' });
		} else {
			if (stateBetDerived.hasAutoBetCounter()) stateBet.autoSpinsCounter = 0;
			context.eventEmitter.broadcast({ type: 'stopButtonClick' });
		}
	};

	const key = $derived.by((): BetKey => {
		if (!roundBusy) return stateBetDerived.isBetCostAvailable() ? 'spin_default' : 'spin_disabled';
		return stateBetDerived.hasAutoBetCounter() ? 'stop_default' : 'spin_disabled';
	});
</script>

{@render props.children({ key, onpress })}
