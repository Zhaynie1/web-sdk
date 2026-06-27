/**
 * Starpetal feature state — the fields starpetal's mechanics need that the
 * cluster engine's stateGame doesn't carry. Kept here (not in the engine's
 * stateGame.svelte) so the engine stays pristine; starpetal components/handlers
 * read this module directly.
 *
 * Runes work in `.svelte.ts`, so this is a live $state singleton just like the
 * engine's own state modules.
 */
import type { RawSymbol, SymbolState } from '$game/types';

/**
 * A small self-cancelling rAF tween we fully own.
 *
 * We deliberately do NOT use svelte/motion's `Tween` here: these are created in a
 * plain event handler (createMultiplierSymbol) and stored in module $state, i.e.
 * outside any component/effect scope — so svelte never disposes the Tween's
 * internal animation effect, and each multiplier collection leaked a persistent
 * rAF loop. This one is disposed explicitly via `stop()` on board reset.
 *
 * A factory (not a class) because `$state` is only allowed as a variable
 * declaration initializer in `.svelte.ts` modules, not as a class field.
 */
export const createRafTween = (initial: number) => {
	let current = $state(initial);
	let frame = 0;
	let pendingResolve: (() => void) | null = null;

	/** Cancel the running animation and resolve any pending `set()` so awaiters
	 * never hang if the collection is interrupted. */
	const stop = () => {
		if (frame) {
			cancelAnimationFrame(frame);
			frame = 0;
		}
		if (pendingResolve) {
			const resolve = pendingResolve;
			pendingResolve = null;
			resolve();
		}
	};

	const set = (
		target: number,
		opts?: { duration?: number; easing?: (t: number) => number },
	): Promise<void> => {
		stop();
		const from = current;
		const duration = opts?.duration ?? 0;
		const easing = opts?.easing ?? ((t) => t);
		if (duration <= 0) {
			current = target;
			return Promise.resolve();
		}
		const start = performance.now();
		return new Promise<void>((resolve) => {
			pendingResolve = resolve;
			const tick = (now: number) => {
				const t = Math.min(1, (now - start) / duration);
				current = from + (target - from) * easing(t);
				if (t < 1) {
					frame = requestAnimationFrame(tick);
				} else {
					frame = 0;
					pendingResolve = null;
					resolve();
				}
			};
			frame = requestAnimationFrame(tick);
		});
	};

	return {
		get current() {
			return current;
		},
		set,
		stop,
	};
};

export type RafTween = ReturnType<typeof createRafTween>;

/** One animated multiplier dewdrop during the boardMultiplierInfo collection. */
export type MultiplierSymbol = {
	initX: number;
	initY: number;
	symbolX: RafTween;
	symbolY: RafTween;
	rawSymbol: RawSymbol;
	symbolState: SymbolState;
	oncomplete: () => void;
};

export const starpetalState = $state<{
	/** Per-reel column of dewdrops (undefined = no dewdrop at that cell). */
	multiplierBoard: (MultiplierSymbol | undefined)[][];
}>({
	multiplierBoard: [],
});
