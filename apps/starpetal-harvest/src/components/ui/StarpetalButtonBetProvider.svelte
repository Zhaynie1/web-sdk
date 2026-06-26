<script lang="ts" module>
	export type ButtonBetKey = 'spin_default' | 'spin_disabled' | 'stop_default' | 'stop_disabled';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	import { stateBet, stateBetDerived } from 'state-shared';

	import { isBetRoundBusy, stateBetRoundBusy } from '../../game/betRoundBusy.svelte';
	import { getContext } from '../../game/context';

	type Props = {
		children: Snippet<
			[
				{
					key: ButtonBetKey;
					onpress: () => void;
				},
			]
		>;
	};

	const props: Props = $props();
	const context = getContext();

	let stopDisabled = $state(false);

	const roundBusy = $derived.by(() => {
		void stateBetRoundBusy.active;
		void context.stateXstate.value;
		return isBetRoundBusy(context.stateXstateDerived);
	});

	const bet = () => {
		if (stateBetDerived.activeBetMode()?.type === 'buy') stateBet.activeBetModeKey = 'BASE';
		context.eventEmitter.broadcast({ type: 'bet' });
	};

	const stop = () => {
		if (!stopDisabled) {
			if (stateBetDerived.hasAutoBetCounter()) stateBet.autoSpinsCounter = 0;
			context.eventEmitter.broadcast({ type: 'stopButtonClick' });
		}
	};

	const onpress = () => {
		const autospin = stateBetDerived.hasAutoBetCounter();

		if (roundBusy && !autospin) return;

		context.eventEmitter.broadcast({ type: 'soundPressBet' });

		if (!roundBusy) {
			bet();
		} else {
			stop();
		}
	};

	const key = $derived.by((): ButtonBetKey => {
		if (!roundBusy) {
			if (!stateBetDerived.isBetCostAvailable()) return 'spin_disabled';
			return 'spin_default';
		}

		if (stateBetDerived.hasAutoBetCounter()) {
			if (stopDisabled) return 'stop_disabled';
			return 'stop_default';
		}

		return 'spin_disabled';
	});

	context.eventEmitter.subscribeOnMount({
		stopButtonEnable: () => {
			stopDisabled = false;
		},
	});
</script>

{@render props.children({ key, onpress })}