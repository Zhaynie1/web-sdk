<script lang="ts" module>
	export type EmitterEventMultiplierGrid =
		| { type: 'multiplierGridShow' }
		| { type: 'multiplierGridHide' }
		| { type: 'multiplierGridUpdate'; grid: number[][] }
		| { type: 'multiplierGridClear' };
</script>

<script lang="ts">
	import BoardContainer from './BoardContainer.svelte';
	import MultiplierGridTile from './MultiplierGridTile.svelte';
	import { getContext } from '../game/context';

	const context = getContext();
	const DEFAULT_GRID = [
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
	];

	let show = $state(false);
	let grid = $state(DEFAULT_GRID);

	context.eventEmitter.subscribeOnMount({
		multiplierGridShow: () => (show = true),
		multiplierGridHide: () => (show = false),
		multiplierGridUpdate: (emitterEvent) => (grid = emitterEvent.grid),
		multiplierGridClear: () => (grid = DEFAULT_GRID),
	});

	// Flatten to active cells keyed by board position. Keying lets a tile persist
	// across grid updates (so it can pulse when its value grows) while newly created
	// cells mount fresh (so they bloom in where the symbol hit).
	const cells = $derived(
		grid
			.flatMap((reel, col) => reel.map((multiplier, row) => ({ col, row, multiplier })))
			.filter((cell) => cell.multiplier > 0),
	);
</script>

<BoardContainer>
	{#if show}
		{#each cells as cell (`${cell.col},${cell.row}`)}
			<MultiplierGridTile col={cell.col} row={cell.row} multiplier={cell.multiplier} />
		{/each}
	{/if}
</BoardContainer>
