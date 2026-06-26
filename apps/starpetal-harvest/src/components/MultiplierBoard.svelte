<script lang="ts" module>
	import type { Position } from '../game/types';

	export type EmitterEventMultiplierBoard =
		| { type: 'multiplierBoardShow' }
		| { type: 'multiplierBoardHide' }
		| { type: 'multiplierBoardInit'; positions?: (Position & { multiplier: number })[] }
		| { type: 'multiplierBoardReset' }
		| { type: 'multiplierBoardAnimate' }
		| { type: 'multiplierBoardMove' };
</script>

<script lang="ts">
	import _ from 'lodash';
	import { Tween } from 'svelte/motion';
	import { quartInOut } from 'svelte/easing';

	import { waitForResolve, waitForTimeout } from 'utils-shared/wait';

	const MULTIPLIER_WIN_TIMEOUT_MS = 2000;

	import MultiplierBoardBase from './MultiplierBoardBase.svelte';
	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import type { RawSymbol, SymbolState } from '../game/types';
	import { getSymbolX, getSymbolY, normalizeMultiplier } from '../game/utils';

	const context = getContext();

	let show = $state(false);

	const createMultiplierSymbol = ({
		rawSymbol,
		reelIndex,
		symbolIndex,
		reelLength,
	}: {
		rawSymbol: RawSymbol;
		reelIndex: number;
		symbolIndex: number;
		reelLength: number;
	}) => {
		if (rawSymbol.name !== 'M' || symbolIndex <= 0 || symbolIndex >= reelLength - 1) {
			return undefined;
		}

		const initX = getSymbolX(reelIndex);
		const initY = getSymbolY(symbolIndex - 1);
		const symbolX = new Tween(initX);
		const symbolY = new Tween(initY);
		const symbolState = 'win' as SymbolState;
		const oncomplete = () => {};

		return {
			initX,
			initY,
			symbolX,
			symbolY,
			rawSymbol,
			symbolState,
			oncomplete,
		};
	};

	const initMultiplierBoardFromPositions = (
		positions: (Position & { multiplier: number })[],
	) => {
		const positionMap = new Map(
			positions.map((pos) => [
				`${pos.reel},${pos.row}`,
				normalizeMultiplier(pos.multiplier) ?? 2,
			]),
		);

		return context.stateGameDerived.boardRaw().map((rawSymbols, reelIndex) =>
			rawSymbols.map((_, symbolIndex) => {
				const multiplier = positionMap.get(`${reelIndex},${symbolIndex}`);
				if (multiplier === undefined) return undefined;

				return createMultiplierSymbol({
					rawSymbol: { name: 'M', multiplier },
					reelIndex,
					symbolIndex,
					reelLength: rawSymbols.length,
				});
			}),
		);
	};

	const initMultiplierBoard = () => {
		return context.stateGameDerived.boardRaw().map((rawSymbols, reelIndex) =>
			rawSymbols.map((rawSymbol, symbolIndex) =>
				createMultiplierSymbol({
					rawSymbol,
					reelIndex,
					symbolIndex,
					reelLength: rawSymbols.length,
				}),
			),
		);
	};

	context.eventEmitter.subscribeOnMount({
		multiplierBoardShow: () => (show = true),
		multiplierBoardHide: () => (show = false),
		multiplierBoardInit: (emitterEvent) => {
			context.stateGame.multiplierBoard =
				emitterEvent.positions?.length
					? initMultiplierBoardFromPositions(emitterEvent.positions)
					: initMultiplierBoard();
		},
		multiplierBoardReset: () => {
			context.stateGame.multiplierBoard = [];
		},
		multiplierBoardAnimate: async () => {
			const getPromises = () =>
				_.flatten(
					context.stateGame.multiplierBoard.map((multiplierReel) => {
						return multiplierReel.filter(Boolean).map(async (multiplierSymbol) => {
							await Promise.race([
								waitForResolve((resolve) => (multiplierSymbol!.oncomplete = resolve)),
								waitForTimeout(MULTIPLIER_WIN_TIMEOUT_MS),
							]);
						});
					}),
				);

			await Promise.all(getPromises());
		},
		multiplierBoardMove: async () => {
			const getPromises = () =>
				_.flatten(
					context.stateGame.multiplierBoard.map((multiplierReel) => {
						return multiplierReel.filter(Boolean).map(async (multiplierSymbol) => {
							const target = {
								x: context.stateGameDerived.boardLayout().width * 0.5,
								y: context.stateGameDerived.boardLayout().height * 0.5,
							};
							const tweenOptions = { duration: 500, easing: quartInOut };
							const moveX = () => multiplierSymbol!.symbolX.set(target.x, tweenOptions);
							const moveY = () => multiplierSymbol!.symbolY.set(target.y, tweenOptions);
							await Promise.all([moveX(), moveY()]);
						});
					}),
				);

			await Promise.all(getPromises());
		},
	});
</script>

{#if show}
	<BoardContainer>
		<MultiplierBoardBase />
	</BoardContainer>
{/if}