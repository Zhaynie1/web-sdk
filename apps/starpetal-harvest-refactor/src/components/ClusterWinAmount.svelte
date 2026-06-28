<script lang="ts" module>
	export type RawWin = {
		win: number;
		mult: number;
		result: number;
		reel: number; // 0 | 1 | 2 | 3 | 4 | 5;
		row: number; // 1 | 2 | 3 | 4 | 5; // excluding the off top row and the off bottom row
	};
	export type Win = RawWin & { oncomplete: () => void };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Tween } from 'svelte/motion';

	import { Container, Graphics } from 'pixi-svelte';
	import { stateBetDerived } from 'state-shared';
	import { SECOND } from 'constants-shared/time';
	import { FadeContainer } from 'components-pixi';
	import { waitForTimeout } from 'utils-shared/wait';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';

	import SilverText from '$starpetal/ui/SilverText.svelte';
	import { SYMBOL_SIZE } from '../game/constants';
	import { getContext } from '../game/context';

	type Props = { win: Win };

	const props: Props = $props();
	const context = getContext();
	const y = new Tween(0);
	const scale = new Tween(1);
	let show = $state(true);

	let showMultiplier = $state(props.win.mult > 1);

	// Cluster highlight + pop timing — sped up (was a 1s multiplier hold + 2s float).
	const timeScale = () => stateBetDerived.timeScale();
	const MULTIPLIER_HOLD_MS = SECOND * 0.4;
	const FLOAT_MS = SECOND * 0.8;
	const POP_MS = 130;

	// Soft aura behind the glossy number — a dark core for legibility over the busy
	// board plus a starlight/violet bloom, matching the multiplier-gem language.
	const drawAura = (g: import('pixi.js').Graphics) => {
		g.clear();
		g.ellipse(0, 0, SYMBOL_SIZE * 0.62, SYMBOL_SIZE * 0.32);
		g.fill({ color: 0x1a0f33, alpha: 0.4 });
		g.ellipse(0, 0, SYMBOL_SIZE * 0.78, SYMBOL_SIZE * 0.42);
		g.fill({ color: 0xc9b3ff, alpha: 0.16 });
	};

	// switch "win × mult" → combined result
	onMount(async () => {
		await waitForTimeout(MULTIPLIER_HOLD_MS / timeScale());
		showMultiplier = false;
	});

	// combine pop, timed to coincide with the result switch
	onMount(async () => {
		if (showMultiplier) {
			await waitForTimeout(MULTIPLIER_HOLD_MS / timeScale());
			context.eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_multiplier_combine_a' });
			await scale.set(0.1, { duration: POP_MS / timeScale() });
			await scale.set(1, { duration: POP_MS / timeScale() });
		}
	});

	// float up then fade out
	onMount(async () => {
		await y.set(-SYMBOL_SIZE, { duration: FLOAT_MS / timeScale() });
		show = false;
	});
</script>

<FadeContainer
	{show}
	oncomplete={() => {
		if (!show) props.win.oncomplete();
	}}
>
	<Container
		x={SYMBOL_SIZE * (props.win.reel + 0.5)}
		y={SYMBOL_SIZE * (props.win.row - 0.5) + y.current}
		scale={scale.current}
	>
		<Graphics draw={drawAura} />
		<SilverText
			anchor={0.5}
			maxWidth={SYMBOL_SIZE * 4}
			targetFontSize={SYMBOL_SIZE * 0.4}
			text={showMultiplier
				? `${bookEventAmountToCurrencyString(props.win.win)} X ${props.win.mult}`
				: bookEventAmountToCurrencyString(props.win.result)}
		/>
	</Container>
</FadeContainer>
