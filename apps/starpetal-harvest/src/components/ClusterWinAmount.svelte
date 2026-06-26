<script lang="ts" module>
	export type RawWin = {
		win: number;
		mult: number;
		result: number;
		reel: number;
		row: number;
		symbol?: string;
		/** Base game: show final currency immediately (no mult breakdown). */
		amountOnly?: boolean;
	};
	export type Win = RawWin & { oncomplete: () => void };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Tween } from 'svelte/motion';

	import { BitmapText } from 'pixi-svelte';
	import { stateBetDerived } from 'state-shared';
	import { FadeContainer } from 'components-pixi';
	import { waitForTimeout } from 'utils-shared/wait';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';

	import { CLUSTER_HIGHLIGHT, SYMBOL_SIZE } from '../game/constants';
	import { getContext } from '../game/context';

	type Props = { win: Win };

	const props: Props = $props();
	const context = getContext();
	const y = new Tween(0);
	const scale = new Tween(1);
	let show = $state(true);

	const amountOnly = $derived(props.win.amountOnly ?? false);
	let showMultiplier = $state(!amountOnly && props.win.mult > 1);
	let completed = false;

	const completeWin = () => {
		if (completed) return;
		completed = true;
		props.win.oncomplete();
	};

	// update showMultiplier
	onMount(async () => {
		if (amountOnly) return;
		await waitForTimeout(
			CLUSTER_HIGHLIGHT.winAmountMultRevealMs / stateBetDerived.timeScale(),
		);
		showMultiplier = false;
	});

	// update scale
	onMount(async () => {
		if (amountOnly || !showMultiplier) return;
		await waitForTimeout(CLUSTER_HIGHLIGHT.winAmountMultCombineDelayMs);
		const popMs = CLUSTER_HIGHLIGHT.winAmountMultPopMs / stateBetDerived.timeScale();
		await scale.set(0.1, { duration: popMs });
		await scale.set(1, { duration: popMs });
	});

	// update y
	onMount(async () => {
		const floatMs = CLUSTER_HIGHLIGHT.winAmountFloatMs / stateBetDerived.timeScale();
		await Promise.race([y.set(-SYMBOL_SIZE, { duration: floatMs }), waitForTimeout(floatMs + 120)]);
		show = false;
		completeWin();
	});
</script>

<FadeContainer
	{show}
	oncomplete={() => {
		if (!show) completeWin();
	}}
>
	<BitmapText
		x={SYMBOL_SIZE * (props.win.reel + 0.5)}
		y={SYMBOL_SIZE * (props.win.row - 0.5) + y.current}
		scale={scale.current}
		text={amountOnly || !showMultiplier
			? bookEventAmountToCurrencyString(props.win.result)
			: `${bookEventAmountToCurrencyString(props.win.win)} X ${props.win.mult}`}
		anchor={0.5}
		style={{
			fontFamily: 'silver',
			fontSize: SYMBOL_SIZE * 0.5,
		}}
	/>
</FadeContainer>
