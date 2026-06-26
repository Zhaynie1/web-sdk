<script lang="ts" module>
	export type EmitterEventMultiplierGrid =
		| { type: 'multiplierGridShow' }
		| { type: 'multiplierGridHide' }
		| { type: 'multiplierGridUpdate'; grid: number[][] }
		| { type: 'multiplierGridClear' };
</script>

<script lang="ts">
	import { BitmapText, Container, Graphics } from 'pixi-svelte';
	import { Tween } from 'svelte/motion';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';
	import { getSymbolX, getSymbolY } from '../game/utils';

	const context = getContext();

	const emptyGrid = () =>
		Array.from({ length: 7 }, () => Array.from({ length: 7 }, () => 0));

	const TILE_WIDTH = SYMBOL_SIZE * 0.72;
	const TILE_HEIGHT = SYMBOL_SIZE * 0.34;
	const TILE_Y_OFFSET = SYMBOL_SIZE * 0.28;

	type CellAnimation = {
		reel: number;
		row: number;
		scale: Tween<number>;
	};

	let show = $state(false);
	let grid = $state(emptyGrid());
	let cellAnimations = $state<CellAnimation[]>([]);

	const findChangedCells = (previous: number[][], next: number[][]) => {
		const changed: { reel: number; row: number }[] = [];
		for (let reel = 0; reel < next.length; reel += 1) {
			for (let row = 0; row < (next[reel]?.length ?? 0); row += 1) {
				if ((previous[reel]?.[row] ?? 0) !== (next[reel]?.[row] ?? 0)) {
					changed.push({ reel, row });
				}
			}
		}
		return changed;
	};

	const animateChangedCells = async (changed: { reel: number; row: number }[]) => {
		if (changed.length === 0) return;

		const animations = changed.map((cell) => ({
			...cell,
			scale: new Tween(1.35),
		}));
		cellAnimations = animations;

		await Promise.all(
			animations.map(async (animation) => {
				await animation.scale.set(1, { duration: 220 });
			}),
		);

		cellAnimations = [];
	};

	const getCellScale = (reelIndex: number, rowIndex: number) =>
		cellAnimations.find((cell) => cell.reel === reelIndex && cell.row === rowIndex)?.scale.current ??
		1;

	context.eventEmitter.subscribeOnMount({
		multiplierGridShow: () => (show = true),
		multiplierGridHide: () => (show = false),
		multiplierGridUpdate: async (emitterEvent) => {
			const changed = findChangedCells(grid, emitterEvent.grid);
			grid = emitterEvent.grid;
			await animateChangedCells(changed);
		},
		multiplierGridClear: () => {
			grid = emptyGrid();
			cellAnimations = [];
		},
	});
</script>

<BoardContainer>
	{#if show}
		{#each grid as reel, reelIndex}
			{#each reel as multiplier, rowIndex}
				{#if multiplier >= 2}
					{@const x = getSymbolX(reelIndex)}
					{@const y = getSymbolY(rowIndex) + TILE_Y_OFFSET}
					{@const scale = getCellScale(reelIndex, rowIndex)}
					<Container {x} {y} scale={scale}>
						<Graphics
							draw={(graphics) => {
								graphics.clear();
								graphics.roundRect(
									-TILE_WIDTH / 2,
									-TILE_HEIGHT / 2,
									TILE_WIDTH,
									TILE_HEIGHT,
									10,
								);
								graphics.fill({ color: 0xe8c97a, alpha: 0.95 });
								graphics.stroke({ color: 0xc9962e, width: 2, alpha: 0.9 });
							}}
						/>
						<BitmapText
							anchor={{ x: 0.5, y: 0.5 }}
							text={`${multiplier}X`}
							style={{
								fontFamily: 'gold',
								fontSize: SYMBOL_SIZE * 0.26,
								letterSpacing: -2,
							}}
						/>
					</Container>
				{/if}
			{/each}
		{/each}
	{/if}
</BoardContainer>