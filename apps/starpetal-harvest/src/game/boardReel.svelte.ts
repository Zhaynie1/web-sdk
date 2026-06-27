import { backOut } from 'svelte/easing';
import { Tween } from 'svelte/motion';

import { stateBet } from 'state-shared';
import { waitForTimeout } from 'utils-shared/wait';
import type { CascadingReelCreateOptions, CascadingReelSpinOptions, SpinType } from 'utils-slots';

export type BoardReelMotion = 'fallingOut' | 'hanging' | 'fallingIn' | 'stopped';

/**
 * Single cascading reel column — fall out, stage new symbols, fall in.
 * Abortable via generation token so settle/stop never fights a stale animation.
 */
export function createBoardReel<TRawSymbol extends object, TSymbolState extends string>(
	reelOptions: CascadingReelCreateOptions<TRawSymbol, TSymbolState>,
) {
	const getSymbolY = (symbolIndexOfBoard: number) =>
		(symbolIndexOfBoard + 0.5) * reelOptions.symbolHeight;

	const createReelSymbol = (reelSymbolOptions: { rawSymbol: TRawSymbol; symbolIndex: number }) => {
		const symbolIndexOfBoard = reelSymbolOptions.symbolIndex - 1;
		const symbolY = new Tween(getSymbolY(symbolIndexOfBoard));

		const reelSymbol = $state({
			rawSymbol: reelSymbolOptions.rawSymbol,
			symbolIndexOfBoard,
			symbolY,
			symbolState: reelOptions.initialSymbolState as TSymbolState,
			oncomplete: () => {},
		});

		return reelSymbol;
	};

	type ReelSymbol = ReturnType<typeof createReelSymbol>;

	const reelLength = reelOptions.initialSymbols.length;
	const reelLengthInBoard = reelLength - 2;

	let targetSymbols = reelOptions.initialSymbols;
	let onSpinFinishing: () => void = () => {};
	let noStop = false;
	let paddingSize = 0;
	let spinGeneration = 0;

	const reelState = $state({
		symbols: reelOptions.initialSymbols.map((rawSymbol, symbolIndex) =>
			createReelSymbol({ rawSymbol, symbolIndex }),
		),
		motion: 'stopped' as BoardReelMotion,
		spinType: 'normal' as SpinType,
		anticipating: false,
		readyToSpin: () => {},
		spinOptions: () => ({}) as CascadingReelSpinOptions,
	});

	const isStale = (generation: number) => generation !== spinGeneration;

	// Resolve pending stale-waiters when the generation actually advances, rather
	// than polling every frame with requestAnimationFrame. The old rAF approach
	// leaked a perpetual loop per call: a Promise.race never cancels its losing
	// arm, so every waitUntilStale whose animation won the race kept ticking
	// forever — hundreds piled up per spin and starved the frame loop.
	let staleWaiters: Array<{ generation: number; resolve: () => void }> = [];

	const notifyStale = () => {
		if (staleWaiters.length === 0) return;
		staleWaiters = staleWaiters.filter((waiter) => {
			if (isStale(waiter.generation)) {
				waiter.resolve();
				return false;
			}
			return true;
		});
	};

	const waitUntilStale = (generation: number) =>
		isStale(generation)
			? Promise.resolve()
			: new Promise<void>((resolve) => {
					staleWaiters.push({ generation, resolve });
				});

	const moveSymbolY = async (
		generation: number,
		reelSymbol: ReelSymbol,
		value: number,
		options?: Parameters<ReelSymbol['symbolY']['set']>[1],
	) => {
		if (isStale(generation)) return;

		const delay = options?.delay ?? 0;
		if (delay > 0) {
			await Promise.race([waitForTimeout(delay), waitUntilStale(generation)]);
			if (isStale(generation)) return;
		}

		const { delay: _delay, ...tweenOptions } = options ?? {};
		await Promise.race([
			reelSymbol.symbolY.set(value, tweenOptions),
			waitUntilStale(generation),
		]);
	};

	const abort = () => {
		spinGeneration++;
		notifyStale();
		reelState.motion = 'stopped';
		reelState.anticipating = false;
		reelState.symbols.forEach((reelSymbol) => {
			const targetY = getSymbolY(reelSymbol.symbolIndexOfBoard);
			reelSymbol.symbolY.set(targetY, { duration: 0 });
			if (reelSymbol.symbolState === 'spin' || reelSymbol.symbolState === 'land') {
				reelSymbol.symbolState = 'static' as TSymbolState;
			}
		});
	};

	const updateSymbols = (value: TRawSymbol[]) => {
		reelState.symbols.forEach((reelSymbol, symbolIndex) => {
			const nextSymbol = value[symbolIndex];
			if (!nextSymbol) return;
			reelSymbol.rawSymbol = nextSymbol;
			reelSymbol.symbolState = 'static' as TSymbolState;
		});
	};

	const animateSymbols = async (
		generation: number,
		run: (reelSymbol: ReelSymbol) => Promise<void>,
	) => {
		await Promise.all(
			reelState.symbols.map(async (reelSymbol) => {
				if (isStale(generation)) return;
				await run(reelSymbol);
			}),
		);
	};

	const fallOut = async (generation: number) => {
		if (isStale(generation)) return;

		const opts = reelState.spinOptions();
		await Promise.race([
			waitForTimeout(opts.reelFallOutDelay * reelOptions.reelIndex),
			waitUntilStale(generation),
		]);
		if (isStale(generation)) return;

		reelState.motion = 'fallingOut';

		await animateSymbols(generation, async (reelSymbol) => {
			if (isStale(generation)) return;

			const delay =
				opts.symbolFallOutInterval * (reelLengthInBoard - reelSymbol.symbolIndexOfBoard);
			if (delay > 0) {
				await Promise.race([waitForTimeout(delay), waitUntilStale(generation)]);
			}
			if (isStale(generation)) return;

			const fromY = reelSymbol.symbolY.current;
			const toY = getSymbolY(reelSymbol.symbolIndexOfBoard + reelLength);
			reelSymbol.symbolState = 'spin' as TSymbolState;
			await moveSymbolY(generation, reelSymbol, toY, {
				duration: Math.max(0, (toY - fromY) / opts.symbolFallOutSpeed),
			});
		});

		if (!isStale(generation)) reelState.motion = 'hanging';
	};

	const stageSymbols = async (generation: number) => {
		if (isStale(generation)) return;

		updateSymbols(targetSymbols);

		await animateSymbols(generation, async (reelSymbol) => {
			if (isStale(generation)) return;
			const stagedY = getSymbolY(reelSymbol.symbolIndexOfBoard - reelLength + 0.5);
			await moveSymbolY(generation, reelSymbol, stagedY, { duration: 0 });
		});
	};

	const fallIn = async (generation: number) => {
		if (isStale(generation)) return;

		const opts = reelState.spinOptions();
		const paddingWait = opts.reelFallInDelay * (paddingSize / reelLength - 1);

		if (paddingWait > 0 && (noStop || stateBet.forceNormalSpinPacing || !stateBet.isTurbo)) {
			await Promise.race([waitForTimeout(paddingWait), waitUntilStale(generation)]);
			if (isStale(generation)) return;
		}

		reelState.motion = 'fallingIn';

		await animateSymbols(generation, async (reelSymbol) => {
			if (isStale(generation)) return;

			const fromY = reelSymbol.symbolY.current;
			const toY = getSymbolY(reelSymbol.symbolIndexOfBoard);
			const distance = toY - fromY;
			const delay =
				opts.symbolFallInInterval * (reelLengthInBoard - reelSymbol.symbolIndexOfBoard);
			const bounceDistance = reelOptions.symbolHeight * opts.symbolFallInBounceSizeMulti;
			const bounceDuration = Math.max(
				0,
				bounceDistance / opts.symbolFallInBounceSpeed,
			);
			const landDuration = Math.max(0, (distance - bounceDistance) / opts.symbolFallInSpeed);

			await moveSymbolY(generation, reelSymbol, toY - bounceDistance, {
				duration: landDuration,
				delay,
			});
			if (isStale(generation)) return;

			reelSymbol.symbolState = 'land' as TSymbolState;
			reelOptions.onSymbolLand({ rawSymbol: reelSymbol.rawSymbol });
			if (reelSymbol.symbolIndexOfBoard === reelLengthInBoard - 1) {
				onSpinFinishing();
			}

			await moveSymbolY(generation, reelSymbol, toY, {
				duration: bounceDuration,
				easing: backOut,
			});
		});

		if (!isStale(generation)) reelState.motion = 'stopped';
	};

	const spin = async () => {
		const generation = spinGeneration;

		if (reelState.motion === 'hanging') {
			await stageSymbols(generation);
			if (isStale(generation)) return;
			await fallIn(generation);
			return;
		}

		await fallOut(generation);
		if (isStale(generation)) return;
		await stageSymbols(generation);
		if (isStale(generation)) return;
		await fallIn(generation);
	};

	const prepareToSpin = (options: {
		noStop: boolean;
		spinType: SpinType;
		symbols: TRawSymbol[];
		paddingPosition: number;
		onSpinFinishing: () => void;
		previousPaddingSize: number;
	}) => {
		reelState.spinType = options.spinType;
		noStop = options.noStop;
		targetSymbols = options.symbols;
		onSpinFinishing = options.onSpinFinishing;

		const opts = reelState.spinOptions();
		const paddingMap = {
			fast: 0,
			normal: options.previousPaddingSize + reelLength * opts.reelPaddingMultiplierNormal,
			anticipated:
				options.previousPaddingSize + reelLength * opts.reelPaddingMultiplierAnticipated,
		};

		paddingSize = paddingMap[options.spinType];
		return paddingSize;
	};

	const preSpin = async ({
		isTurboBeforeAll,
	}: {
		isTurboBeforeAll: boolean;
		preSpinPaddingReel?: TRawSymbol[];
	}) => {
		const generation = spinGeneration;
		reelState.spinType = isTurboBeforeAll ? 'fast' : 'normal';

		if (!isTurboBeforeAll) {
			await Promise.race([
				waitForTimeout(reelState.spinOptions().reelFallOutDelay * reelOptions.reelIndex),
				waitUntilStale(generation),
			]);
			if (isStale(generation)) return;
		}

		await fallOut(generation);
	};

	const setSymbolsWithRawSymbols = (value?: TRawSymbol[]) => {
		reelState.motion = 'stopped';
		if (value?.length) updateSymbols(value);
	};

	const stop = () => abort();

	const readyToSpinEffect = () => {
		$effect(() => {
			if (reelState.motion === 'hanging') reelState.readyToSpin();
		});
	};

	return {
		reelIndex: reelOptions.reelIndex,
		symbolHeight: reelOptions.symbolHeight,
		onReelStopping: reelOptions.onReelStopping,
		reelLength,
		reelState,
		preSpin,
		prepareToSpin,
		spin,
		stop,
		setSymbolsWithRawSymbols,
		readyToSpinEffect,
	};
}