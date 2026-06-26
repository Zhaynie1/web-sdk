import { backOut } from 'svelte/easing';
import { Tween } from 'svelte/motion';

import { stateBet } from 'state-shared';
import { waitForTimeout } from 'utils-shared/wait';
import { createInterruptible } from 'utils-shared/interruptible';

import type { CascadingReelCreateOptions, CascadingReelSpinOptions, SpinType } from './types';

export type CascadingReelMotion = 'fallingOut' | 'hanging' | 'fallingIn' | 'stopped';
export type CascadingReelSymbolState = 'static' | 'land' | 'spin';

export function createReelForCascading<TRawSymbol extends object, TSymbolState extends string>(
	reelOptions: CascadingReelCreateOptions<TRawSymbol, TSymbolState>,
) {
	// reelSymbols
	const getSymbolY = (symbolIndexOfBoard: number) =>
		(symbolIndexOfBoard + 0.5) * reelOptions.symbolHeight;

	const createReelSymbol = (reelSymbolOptions: { rawSymbol: TRawSymbol; symbolIndex: number }) => {
		const symbolIndexOfBoard = reelSymbolOptions.symbolIndex - 1;
		const rawSymbol = reelSymbolOptions.rawSymbol;
		const symbolState = reelOptions.initialSymbolState;

		const initY = getSymbolY(symbolIndexOfBoard);
		const symbolY = new Tween(initY);
		const oncomplete = () => {};

		const reelSymbol = $state({
			rawSymbol,
			symbolIndexOfBoard,
			symbolY,
			symbolState,
			oncomplete,
		});

		return reelSymbol;
	};

	type ReelSymbol = ReturnType<typeof createReelSymbol>;

	const createReelSymbols: (value: TRawSymbol[]) => ReelSymbol[] = (rawSymbols) => {
		const reelSymbols = rawSymbols.map((rawSymbol, symbolIndex) =>
			createReelSymbol({ rawSymbol, symbolIndex }),
		);

		return reelSymbols;
	};

	const updateSymbols = (value: TRawSymbol[]) => {
		reelState.symbols.forEach((reelSymbol, symbolIndex) => {
			const nextSymbol = value[symbolIndex];
			if (!nextSymbol) return;
			reelSymbol.rawSymbol = nextSymbol;
			reelSymbol.symbolState = 'static' as TSymbolState;
		});
	};

	// constants
	const reelLength = reelOptions.initialSymbols.length;
	const reelLengthInBoard = reelLength - 2;

	// interruptible
	const interruptible = createInterruptible();

	// reactive states
	const reelState = $state({
		symbols: createReelSymbols(reelOptions.initialSymbols),
		motion: 'stopped' as CascadingReelMotion,
		spinType: 'normal' as SpinType,
		anticipating: false,
		readyToSpin: () => {},
		spinOptions: () => ({}) as CascadingReelSpinOptions,
	});
	const basePaddingSize = () => reelLength * reelState.spinOptions().reelPaddingMultiplierNormal;
	const anticipatedPaddingSize = () =>
		reelLength * reelState.spinOptions().reelPaddingMultiplierAnticipated;

	// internal states
	let targetSymbols = reelOptions.initialSymbols;
	let onSpinFinishing: () => void = () => {};
	let noStop = false;
	let paddingSize = 0;
	let spinCancelled = false;

	const delaySpinByReelIndex = async () => {
		await waitForTimeout(reelState.spinOptions().reelFallOutDelay * reelOptions.reelIndex);
	};

	const preSpin = async ({
		isTurboBeforeAll,
	}: {
		isTurboBeforeAll: boolean; // To avoid previous spinType has effect on "getSpinOption" in "slideDownLoop"
	}) => {
		reelState.spinType = isTurboBeforeAll ? 'fast' : 'normal';
		if (!isTurboBeforeAll) await delaySpinByReelIndex();
		await fallOut();
	};

	const moveAllSymbolsWith = async (moveSymbol: (reelSymbol: ReelSymbol) => Promise<void>) => {
		if (spinCancelled) return;
		await Promise.all(reelState.symbols.map(moveSymbol));
	};

	const fallOut = async () => {
		if (spinCancelled) return;
		reelState.motion = 'fallingOut';

		await moveAllSymbolsWith(async (reelSymbol) => {
			if (spinCancelled) return;

			const oldSymbolY = reelSymbol.symbolY.current;
			const newSymbolY = getSymbolY(reelSymbol.symbolIndexOfBoard + reelLength);
			const distance = newSymbolY - oldSymbolY;
			const duration = Math.max(0, distance / reelState.spinOptions().symbolFallOutSpeed);
			const delay =
				reelState.spinOptions().symbolFallOutInterval *
				(reelLengthInBoard - reelSymbol.symbolIndexOfBoard);

			await waitForTimeout(delay);
			if (spinCancelled) return;
			reelSymbol.symbolState = 'spin' as TSymbolState;
			await reelSymbol.symbolY.set(newSymbolY, { duration });
		});

		if (!spinCancelled) reelState.motion = 'hanging';
	};

	const hanging = async () => {
		if (spinCancelled) return;
		updateSymbols(targetSymbols);

		await moveAllSymbolsWith(async (reelSymbol) => {
			if (spinCancelled) return;

			const newSymbolY = getSymbolY(reelSymbol.symbolIndexOfBoard - reelLength + 0.5);
			await reelSymbol.symbolY.set(newSymbolY, { duration: 0 });
		});
	};

	const fallIn = async () => {
		if (spinCancelled) return;

		const fallInDelayMultiplier = paddingSize / reelLength - 1;
		const waitToStartFallingIn = async () =>
			await waitForTimeout(reelState.spinOptions().reelFallInDelay * fallInDelayMultiplier);

		// Q: When to skip the waitToStartFallingIn?
		// A: When stop button is clicked(isTurbo) and is noStop is false
		if (noStop) {
			await waitToStartFallingIn();
		} else if (!stateBet.forceNormalSpinPacing && stateBet.isTurbo) {
			// skip
		} else {
			await interruptible.add(waitToStartFallingIn);
		}

		if (spinCancelled) return;

		reelState.motion = 'fallingIn';

		await moveAllSymbolsWith(async (reelSymbol) => {
			if (spinCancelled) return;

			const oldSymbolY = reelSymbol.symbolY.current;
			const newSymbolY = getSymbolY(reelSymbol.symbolIndexOfBoard);
			const distance = newSymbolY - oldSymbolY;
			const delay =
				reelState.spinOptions().symbolFallInInterval *
				(reelLengthInBoard - reelSymbol.symbolIndexOfBoard);
			const bounceDistance =
				reelOptions.symbolHeight * reelState.spinOptions().symbolFallInBounceSizeMulti;
			const bounceDuration = Math.max(
				0,
				bounceDistance / reelState.spinOptions().symbolFallInBounceSpeed,
			);
			const landDuration = Math.max(
				0,
				(distance - bounceDistance) / reelState.spinOptions().symbolFallInSpeed,
			);

			await reelSymbol.symbolY.set(newSymbolY - bounceDistance, {
				duration: landDuration,
				delay,
			});
			if (spinCancelled) return;
			reelSymbol.symbolState = 'land' as TSymbolState;
			reelOptions.onSymbolLand({ rawSymbol: reelSymbol.rawSymbol });
			if (reelSymbol.symbolIndexOfBoard === reelLengthInBoard - 1) {
				onSpinFinishing();
			}
			await reelSymbol.symbolY.set(newSymbolY, {
				duration: bounceDuration,
				easing: backOut,
			});
		});

		if (!spinCancelled) reelState.motion = 'stopped';
	};

	const generalSpin = async () => {
		if (spinCancelled) return;

		const isHanging = reelState.motion === 'hanging';

		if (!isHanging) {
			await fallOut();
			if (spinCancelled) return;
		}
		await hanging();
		if (spinCancelled) return;
		await fallIn();
	};

	// Keep redundancy here for the comparison to createSpinningReel
	const fastSpin = () => generalSpin();
	const normalSpin = () => generalSpin();
	const anticipatedSpin = () => generalSpin();

	const SPIN_MAP = {
		fast: fastSpin,
		normal: normalSpin,
		anticipated: anticipatedSpin,
	};

	const prepareToSpin = (prepareToSpinOptions: {
		noStop: boolean;
		spinType: SpinType;
		symbols: TRawSymbol[];
		paddingPosition: number;
		onSpinFinishing: () => void;
		previousPaddingSize: number;
	}) => {
		spinCancelled = false;
		reelState.spinType = prepareToSpinOptions.spinType;

		noStop = prepareToSpinOptions.noStop;
		targetSymbols = prepareToSpinOptions.symbols;
		onSpinFinishing = prepareToSpinOptions.onSpinFinishing;

		const GET_PADDING_SIZE_MAP = {
			fast: 0,
			normal: prepareToSpinOptions.previousPaddingSize + basePaddingSize(),
			anticipated: prepareToSpinOptions.previousPaddingSize + anticipatedPaddingSize(),
		};

		paddingSize = GET_PADDING_SIZE_MAP[prepareToSpinOptions.spinType];

		return paddingSize;
	};

	const spin = async () => {
		await SPIN_MAP[reelState.spinType]();
	};

	const setSymbolsWithRawSymbols = (value?: TRawSymbol[]) => {
		reelState.motion = 'stopped';
		if (value && value.length > 0) {
			updateSymbols(value);
		}
	};

	const stop = () => {
		spinCancelled = true;
		interruptible.interrupt();
		reelState.motion = 'stopped';
		reelState.anticipating = false;
		reelState.symbols.forEach((reelSymbol) => {
			void reelSymbol.symbolY.set(getSymbolY(reelSymbol.symbolIndexOfBoard), { duration: 0 });
			reelSymbol.symbolState = 'static' as TSymbolState;
		});
	};

	const readyToSpinEffect = () => {
		$effect(() => {
			if (reelState.motion === 'hanging') {
				reelState.readyToSpin();
			}
		});
	};

	return {
		// from options
		reelIndex: reelOptions.reelIndex,
		symbolHeight: reelOptions.symbolHeight,
		onReelStopping: reelOptions.onReelStopping,
		reelLength,
		// reactive states
		reelState,
		// methods
		preSpin,
		prepareToSpin,
		spin,
		stop,
		setSymbolsWithRawSymbols,
		readyToSpinEffect,
	};
}
