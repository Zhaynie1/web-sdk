<script lang="ts" module>
	export type EmitterEventGlobalMultiplier =
		| { type: 'globalMultiplierShow' }
		| { type: 'globalMultiplierHide' }
		| { type: 'globalMultiplierUpdate'; multiplier: number };
</script>

<script lang="ts">
	import { Container, Graphics, Text } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';
	import { stateBetDerived } from 'state-shared';

	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';
	import { THEME } from '$starpetal/config/theme';
	import { drawVineWinPanel } from '$starpetal/ui/draw/drawVineWinPanel';
	import { createRafTween } from '$starpetal/game/state.svelte';

	// Starpetal global multiplier badge: a compact vine plaque + silver "N×",
	// matching the game's theme (the cluster sample used the globalMultiplier spine
	// + gold font). Floats at the top-right corner above the reels during free spins.
	const context = getContext();

	const PANEL_W = SYMBOL_SIZE * 1.55;
	const PANEL_H = SYMBOL_SIZE * 0.95;

	const desktopPosition = $derived({
		x: context.stateGameDerived.boardLayout().width - PANEL_W * 0.62,
		y: -SYMBOL_SIZE * 0.5,
	});
	const portraitPosition = $derived({
		x: context.stateGameDerived.boardLayout().width - PANEL_W * 0.72,
		y: -SYMBOL_SIZE * 0.6,
	});
	const position = $derived(
		context.stateLayoutDerived.isStacked() ? portraitPosition : desktopPosition,
	);
	const baseScale = $derived(context.stateLayoutDerived.isStacked() ? 1.28 : 1);

	let show = $state(false);
	let multiplier = $state(1);
	const pulse = createRafTween(1);

	context.eventEmitter.subscribeOnMount({
		globalMultiplierShow: () => (show = true),
		globalMultiplierHide: () => (show = false),
		globalMultiplierUpdate: async (emitterEvent) => {
			const next = emitterEvent.multiplier;
			if (next === multiplier) return;
			const increased = next > multiplier;
			multiplier = next;

			if (increased) {
				context.eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_multiplier_update' });
			} else if (next === 1) {
				context.eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_multiplier_reset' });
			}

			// brief scale pulse on change (resolves the awaited broadcast)
			const ts = stateBetDerived.timeScale() || 1;
			await pulse.set(1.35, { duration: 140 / ts });
			await pulse.set(1, { duration: 160 / ts });
		},
	});
</script>

<FadeContainer {show}>
	<BoardContainer>
		<Container {...position} scale={baseScale}>
			<Container scale={pulse.current}>
				<Graphics
					draw={(g) => drawVineWinPanel(g, PANEL_W, PANEL_H, { compact: true, solid: true, glow: true })}
				/>
				<Text
					anchor={0.5}
					resolution={2}
					text={`${multiplier}×`}
					style={{
						fontFamily: 'proxima-nova, Impact, sans-serif',
						fontSize: PANEL_H * 0.46,
						fontWeight: '900',
						fill: THEME.silver,
						stroke: { color: THEME.silverStroke, width: 3 },
						align: 'center',
					}}
				/>
			</Container>
		</Container>
	</BoardContainer>
</FadeContainer>
