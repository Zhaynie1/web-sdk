<script lang="ts">
	import { onMount } from 'svelte';

	import { Text } from 'pixi-svelte';

	import { gameActor } from '../game/actor';
	import { getContext } from '../game/context';
	import { canStartLocalSpin, isLocalPlayRoute, runLocalBook, runLocalAutoSpinLoop } from '../game/localPlay';
	import { tickBetRoundWatchdog } from '../game/spinSafety';

	type Props = {
		debug?: boolean;
	};

	const props: Props = $props();
	const context = getContext();

	onMount(() => {
		const { unsubscribe } = gameActor.subscribe((snapshot) => {
			context.stateXstate.value = snapshot.value;
		});

		gameActor.start();
		gameActor.send({ type: 'RENDERED' });

		const watchdog = setInterval(tickBetRoundWatchdog, 2000);

		return () => {
			// Equivalent to onDestroy(); Leave this comment for searching.
			clearInterval(watchdog);
			unsubscribe();
			gameActor.stop();
		};
	});

	context.eventEmitter.subscribeOnMount({
		bet: () => {
			if (isLocalPlayRoute()) {
				if (!canStartLocalSpin()) return;
				void runLocalBook();
				return;
			}
			gameActor.send({ type: 'BET' });
		},
		autoBet: () => {
			if (isLocalPlayRoute()) {
				void runLocalAutoSpinLoop();
				return;
			}
			gameActor.send({ type: 'AUTO_BET' });
		},
		resumeBet: () => {
			if (typeof window !== 'undefined' && window.location.pathname.startsWith('/play')) return;
			gameActor.send({ type: 'RESUME_BET' });
		},
	});
</script>

{#if props.debug}
	<Text
		x={context.stateLayoutDerived.canvasSizes().width}
		anchor={{ x: 1, y: 0 }}
		style={{ fill: 0xffffff }}
		text={JSON.stringify(context.stateXstate.value, undefined, 2)}
	/>
{/if}