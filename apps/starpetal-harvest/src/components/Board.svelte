<script lang="ts" module>
	import type { RawSymbol, Position } from '../game/types';

	export type EmitterEventBoard =
		| { type: 'boardSettle'; board: RawSymbol[][] }
		| { type: 'boardShow' }
		| { type: 'boardHide' }
		| { type: 'boardClearClusterHighlight' }
		| {
				type: 'boardExplodeSymbols';
				symbolPositions: Position[];
		  }
		| {
				type: 'boardTumbleRefill';
				explodePositions: Position[];
				settledBoard: RawSymbol[][];
		  }
		| {
				type: 'boardHighlightCluster';
				symbolPositions: Position[];
		  }
		| {
				type: 'boardWithAnimateSymbols';
				symbolPositions: Position[];
		  };
</script>

<script lang="ts">
	import { waitForResolve } from 'utils-shared/wait';
	import { waitForTimeout } from 'utils-shared/wait';
	import { BoardContext } from 'components-shared';

	import { CLUSTER_HIGHLIGHT } from '../game/constants';
	import { animateBoardTumble } from '../game/animateBoardTumble';
	import { cloneBoard } from '../game/sanitizeBook';
	import { getContext } from '../game/context';
	import { playClusterConnectSound } from '../game/starpetalSfx';
	import { shouldFastPathAnimations } from '../game/panelWait';
	import Anticipations from './Anticipations.svelte';
	import BoardContainer from './BoardContainer.svelte';
	import BoardMask from './BoardMask.svelte';
	import BoardBase from './BoardBase.svelte';

	const EXPLODE_DURATION_MS = 240;
	const WIN_ANIMATE_TIMEOUT_MS = 2000;

	const context = getContext();

	let show = $state(true);

	context.eventEmitter.subscribeOnMount({
		stopButtonClick: () => context.stateGameDerived.enhancedBoard.stop(),
		boardSettle: ({ board }) => {
			context.stateGame.logicalBoard = cloneBoard(board);
			context.stateGameDerived.enhancedBoard.settle(board);
		},
		boardShow: () => (show = true),
		boardHide: () => (show = false),
		boardClearClusterHighlight: () => {
			context.stateGame.board.forEach((reel) => {
				reel.reelState.symbols.forEach((reelSymbol) => {
					if (reelSymbol.symbolState === 'clusterPreWin') {
						reelSymbol.symbolState = 'static';
					}
				});
			});
		},
		boardExplodeSymbols: async ({ symbolPositions }) => {
			const explodeMs = shouldFastPathAnimations() ? 60 : EXPLODE_DURATION_MS;

			const explodeKeys = new Set(symbolPositions.map((pos) => `${pos.reel},${pos.row}`));

			const getPromises = () =>
				symbolPositions.map(async (position) => {
					if (!explodeKeys.has(`${position.reel},${position.row}`)) return;
					const reelSymbol =
						context.stateGame.board[position.reel]?.reelState.symbols[position.row];
					if (!reelSymbol) return;
					reelSymbol.symbolState = 'explosion';
					await Promise.race([
						waitForResolve((resolve) => (reelSymbol.oncomplete = resolve)),
						waitForTimeout(explodeMs),
					]);
				});

			await Promise.all(getPromises());
			await waitForTimeout(shouldFastPathAnimations() ? 0 : 10);
		},
		boardTumbleRefill: async ({ explodePositions, settledBoard }) => {
			await animateBoardTumble({
				board: context.stateGame.board,
				explodePositions,
				settledBoard,
			});
		},
		boardHighlightCluster: async ({ symbolPositions }) => {
			playClusterConnectSound();

			context.stateGame.board.forEach((reel) => {
				reel.reelState.symbols.forEach((reelSymbol) => {
					if (reelSymbol.symbolState === 'clusterPreWin') {
						reelSymbol.symbolState = 'static';
					}
				});
			});

			const hitKeys = new Set(symbolPositions.map((pos) => `${pos.reel},${pos.row}`));

			symbolPositions.forEach((position) => {
				if (!hitKeys.has(`${position.reel},${position.row}`)) return;
				const reelSymbol =
					context.stateGame.board[position.reel]?.reelState.symbols[position.row];
				if (!reelSymbol) return;
				if (reelSymbol.symbolState === 'clusterPreWin') {
					reelSymbol.symbolState = 'static';
				}
				reelSymbol.symbolState = 'clusterPreWin';
			});
			await waitForTimeout(CLUSTER_HIGHLIGHT.holdMs);
		},
		boardWithAnimateSymbols: async ({ symbolPositions }) => {
			const getPromises = () =>
				symbolPositions.map(async (position) => {
					const reelSymbol =
						context.stateGame.board[position.reel]?.reelState.symbols[position.row];
					if (!reelSymbol) return;
					reelSymbol.symbolState = 'win';
					await Promise.race([
						waitForResolve((resolve) => (reelSymbol.oncomplete = resolve)),
						waitForTimeout(WIN_ANIMATE_TIMEOUT_MS),
					]);
					reelSymbol.symbolState = 'postWinStatic';
				});

			await Promise.all(getPromises());
		},
	});

	context.stateGameDerived.enhancedBoard.readyToSpinEffect();
</script>

{#if show}
	<BoardContext animate={false}>
		<BoardContainer>
			<BoardMask />
			<BoardBase />
		</BoardContainer>
	</BoardContext>

	<BoardContext animate={true}>
		<BoardContainer>
			<BoardBase />
			<Anticipations />
		</BoardContainer>
	</BoardContext>
{/if}
