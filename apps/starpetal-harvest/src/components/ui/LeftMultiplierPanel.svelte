<script lang="ts">
	import { Container, Sprite, Text } from 'pixi-svelte';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';

	import { getContextEventEmitter } from 'utils-event-emitter';
	import type { RawWin } from '../ClusterWinAmount.svelte';
	import type { EmitterEventGame } from '../../game/typesEmitterEvent';
	import { SYMBOL_SIZE } from '../../game/constants';
	import { getSymbolInfo } from '../../game/utils';

	type Props = {
		x?: number;
		y?: number;
		width?: number;
		height?: number;
	};

	const props: Props = $props();
	const { eventEmitter } = getContextEventEmitter<EmitterEventGame>();

	type TumbleEntry = { symbol: string; mult: number; result: number };

	const MAX_ENTRIES = 5;
	const ROW_HEIGHT = 36;
	const ICON_SIZE = SYMBOL_SIZE * 0.34;

	let entries = $state<TumbleEntry[]>([]);
	let runningTotal = $state(0);

	const panelWidth = $derived(props.width ?? 120);
	const panelHeight = $derived(props.height ?? 200);
	const hasContent = $derived(entries.length > 0 || runningTotal > 0);

	const symbolInfoFor = (symbol: string) =>
		getSymbolInfo({ rawSymbol: { name: symbol }, state: 'static' });

	eventEmitter.subscribeOnMount({
		tumbleWinAmountReset: () => {
			entries = [];
			runningTotal = 0;
		},
		tumbleWinAmountUpdate: (emitterEvent) => {
			runningTotal = emitterEvent.amount;
		},
		showClusterWinAmounts: (emitterEvent: { wins: RawWin[] }) => {
			const next = [...entries];
			for (const win of emitterEvent.wins) {
				if (win.result <= 0 || !win.symbol) continue;
				next.push({ symbol: win.symbol, mult: win.mult, result: win.result });
			}
			entries = next.slice(-MAX_ENTRIES);
		},
	});
</script>

{#if hasContent}
	<Container x={props.x} y={props.y}>
		{#if runningTotal > 0}
			<Container y={-panelHeight * 0.5 + 14}>
				<Text
					anchor={{ x: 0.5, y: 0.5 }}
					text={bookEventAmountToCurrencyString(runningTotal)}
					style={{
						fontFamily: 'proxima-nova, Impact, sans-serif',
						fontSize: 20,
						fontWeight: '900',
						fill: 0xffd54a,
						stroke: { color: 0x4a2800, width: 3 },
					}}
				/>
			</Container>
		{/if}

		{#each entries as entry, index}
			{@const rowY =
				-panelHeight * 0.5 + (runningTotal > 0 ? 40 : 18) + index * ROW_HEIGHT}
			{@const symbolInfo = symbolInfoFor(entry.symbol)}
			<Container y={rowY}>
				<Sprite
					anchor={0.5}
					x={-panelWidth * 0.28}
					key={symbolInfo.assetKey}
					width={ICON_SIZE * symbolInfo.sizeRatios.width}
					height={ICON_SIZE * symbolInfo.sizeRatios.height}
				/>
				{#if entry.mult > 1}
					<Text
						anchor={{ x: 0, y: 0.5 }}
						x={-panelWidth * 0.1}
						text={`${entry.mult}x`}
						style={{
							fontFamily: 'proxima-nova, Impact, sans-serif',
							fontSize: 15,
							fontWeight: '900',
							fill: entry.mult >= 10 ? 0xc77dff : 0x6ec8ff,
							stroke: { color: 0x000000, width: 2 },
						}}
					/>
					<Text
						anchor={{ x: 0, y: 0.5 }}
						x={panelWidth * 0.04}
						text={bookEventAmountToCurrencyString(entry.result)}
						style={{
							fontFamily: 'proxima-nova',
							fontSize: 15,
							fontWeight: '700',
							fill: 0xffffff,
							stroke: { color: 0x000000, width: 2 },
						}}
					/>
				{:else}
					<Text
						anchor={{ x: 0, y: 0.5 }}
						x={-panelWidth * 0.1}
						text={bookEventAmountToCurrencyString(entry.result)}
						style={{
							fontFamily: 'proxima-nova',
							fontSize: 15,
							fontWeight: '700',
							fill: 0xffffff,
							stroke: { color: 0x000000, width: 2 },
						}}
					/>
				{/if}
			</Container>
		{/each}
	</Container>
{/if}