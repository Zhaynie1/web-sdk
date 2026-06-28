<script lang="ts" module>
	import type { RawSymbol, Position } from '../game/types';

	export type EmitterEventBoard =
		| { type: 'boardSettle'; board: RawSymbol[][] }
		| { type: 'boardShow' }
		| { type: 'boardHide' }
		| {
				type: 'boardWithAnimateSymbols';
				symbolPositions: Position[];
		  };
</script>

<script lang="ts">
	import { waitForResolve, waitForTimeout } from 'utils-shared/wait';
	import { BoardContext } from 'components-shared';
	import { stateBetDerived } from 'state-shared';

	import { getContext } from '../game/context';
	import BoardContainer from './BoardContainer.svelte';
	import BoardMask from './BoardMask.svelte';
	import BoardBase from './BoardBase.svelte';

	const context = getContext();

	// Cap on a single win-symbol highlight. The presentation waits for the symbol's
	// spine `complete` event, but that event can be dropped (e.g. a timeScale change
	// mid-animation from the turbo tap), which would hang the round. Keep this short so
	// a dropped `complete` just ends the brief highlight instead of freezing the reels.
	const WIN_ANIMATE_TIMEOUT_MS = 350;

	let show = $state(true);

	context.eventEmitter.subscribeOnMount({
		stopButtonClick: () => context.stateGameDerived.enhancedBoard.stop(),
		boardSettle: ({ board }) => context.stateGameDerived.enhancedBoard.settle(board),
		boardShow: () => (show = true),
		boardHide: () => (show = false),
		boardWithAnimateSymbols: async ({ symbolPositions }) => {
			// Dedupe positions: a WILD cell substitutes into multiple winning clusters, so
			// the same (reel,row) appears more than once in the flattened win positions.
			// Without dedup, the duplicate overwrites the first symbol's `oncomplete`
			// resolver, so that first wait never resolves and only ends when the cap fires —
			// the brief freeze seen exclusively on clusters containing wilds.
			const seen = new Set<string>();
			const uniquePositions = symbolPositions.filter((position) => {
				const key = `${position.reel}:${position.row}`;
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
			const getPromises = () =>
				uniquePositions.map(async (position) => {
					const reelSymbol = context.stateGame.board[position.reel].reelState.symbols[position.row];
					reelSymbol.symbolState = 'win';
					await Promise.race([
						waitForResolve((resolve) => (reelSymbol.oncomplete = resolve)),
						waitForTimeout(WIN_ANIMATE_TIMEOUT_MS / stateBetDerived.timeScale()),
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
		</BoardContainer>
	</BoardContext>
{/if}
