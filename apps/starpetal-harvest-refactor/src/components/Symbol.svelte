<script lang="ts">
	import { Graphics } from 'pixi-svelte';

	import SymbolSpine from './SymbolSpine.svelte';
	import SymbolSprite from './SymbolSprite.svelte';
	import SymbolPop from './SymbolPop.svelte';
	import type { SymbolState, RawSymbol } from '../game/types';
	import { SYMBOL_SIZE } from '../game/constants';
	import { getSymbolInfo } from '../game/utils';
	import { getContext } from '../game/context';
	import { THEME } from '$starpetal/config/theme';

	type Props = {
		x?: number;
		y?: number;
		state: SymbolState;
		rawSymbol: RawSymbol;
		oncomplete?: () => void;
		loop?: boolean;
	};

	const props: Props = $props();
	const context = getContext();
	const symbolInfo = $derived(getSymbolInfo({ rawSymbol: props.rawSymbol, state: props.state }));
	const isSprite = $derived(symbolInfo.type === 'sprite');
	// Cluster pop: render the symbol's own sprite scaling up + fading (generic pop)
	// instead of the leftover explosion spine.
	const isExplosion = $derived(props.state === 'explosion');
	const popInfo = $derived(getSymbolInfo({ rawSymbol: props.rawSymbol, state: 'static' }));
	const showWinFrame = $derived(
		['win', 'postWinStatic'].includes(props.state) && !['S'].includes(props.rawSymbol.name),
	);

	// White cluster-win glow, drawn behind the winning symbol (replaces the orange
	// payframe spine): a soft halo + bright white frame + a few starlight sparkles.
	const GLOW = SYMBOL_SIZE * 0.96;
	const SPARKLES = [
		{ x: -0.52, y: -0.48, r: 1.6, a: 0.9 },
		{ x: 0.38, y: -0.42, r: 1.2, a: 0.7 },
		{ x: -0.28, y: 0.36, r: 1.3, a: 0.8 },
		{ x: 0.5, y: 0.28, r: 1.0, a: 0.6 },
		{ x: 0.12, y: 0.52, r: 1.4, a: 0.75 },
	] as const;

	const drawWinGlow = (g: import('pixi.js').Graphics) => {
		g.clear();
		const half = GLOW / 2;

		// layered soft halo — violet-tinted outer to harmonize with the multiplier gems
		g.roundRect(-half - 7, -half - 7, GLOW + 14, GLOW + 14, 20);
		g.fill({ color: 0xc9b3ff, alpha: 0.1 });
		g.roundRect(-half - 3, -half - 3, GLOW + 6, GLOW + 6, 17);
		g.fill({ color: 0xffffff, alpha: 0.12 });
		// inner wash
		g.roundRect(-half, -half, GLOW, GLOW, 14);
		g.fill({ color: 0xffffff, alpha: 0.14 });
		// beveled frame: bright white outer rim + starlight inner line (matches gem rim)
		g.roundRect(-half, -half, GLOW, GLOW, 14);
		g.stroke({ color: 0xffffff, width: 3, alpha: 0.95 });
		g.roundRect(-half + 3, -half + 3, GLOW - 6, GLOW - 6, 12);
		g.stroke({ color: THEME.starlight, width: 1.5, alpha: 0.6 });
		// top gloss highlight
		g.roundRect(-half + 5, -half + 4, GLOW - 10, GLOW * 0.22, 8);
		g.fill({ color: 0xffffff, alpha: 0.18 });

		for (const sparkle of SPARKLES) {
			const sx = sparkle.x * half;
			const sy = sparkle.y * half;
			g.circle(sx, sy, sparkle.r);
			g.fill({ color: 0xffffff, alpha: sparkle.a });
		}
	};
</script>

{#if showWinFrame}
	<Graphics zIndex={-1} x={props.x} y={props.y} draw={drawWinGlow} />
{/if}

{#if isExplosion}
	<SymbolPop symbolInfo={popInfo} x={props.x} y={props.y} oncomplete={props.oncomplete} />
{:else if isSprite}
	<SymbolSprite {symbolInfo} x={props.x} y={props.y} oncomplete={props.oncomplete} />
{:else}
	<SymbolSpine
		loop={props.loop}
		{symbolInfo}
		x={props.x}
		y={props.y}
		listener={{
			complete: props.oncomplete,
			event: (_, event) => {
				if (event.data?.name === 'wildExplode') {
					context.eventEmitter?.broadcast({ type: 'soundOnce', name: 'sfx_wild_explode' });
				}
			},
		}}
	/>
{/if}
