<script lang="ts" module>
	export type EmitterEventMultiplierTotal =
		| { type: 'multiplierTotalShow' }
		| { type: 'multiplierTotalHide' }
		| { type: 'multiplierTotalUpdate'; totalMultiplier: number }
		| { type: 'multiplierTotalAnimate' };
</script>

<script lang="ts">
	import { Container, Graphics } from 'pixi-svelte';
	import { backOut, cubicOut } from 'svelte/easing';
	import { stateBetDerived } from 'state-shared';
	import { waitForTimeout } from 'utils-shared/wait';

	import { getContext } from '$game/context';
	import { SYMBOL_SIZE } from '$game/constants';
	import { createRafTween } from '$starpetal/game/state.svelte';
	import { drawVineWinPanel } from '$starpetal/ui/draw/drawVineWinPanel';
	import SilverText from '$starpetal/ui/SilverText.svelte';
	import BoardContainer from '$components/BoardContainer.svelte';

	// Grand total of a bonus's collected multipliers. Reuses our established vine +
	// silver plaque (the same `drawVineWinPanel` the TUMBLE WIN counter and reel frame
	// use) so it matches our look — not the old Stake/miner `tumble_multiplier` spine
	// or an invented skin. Animation is deterministic (never waits on a spine `complete`
	// event), so it cannot reintroduce the bonus freeze.
	const EXPLOSION_DURATION_MS = 280;

	const context = getContext();

	let show = $state(false);
	let totalMultiplier = $state(0);

	const popScale = createRafTween(1);
	const flash = createRafTween(0);

	context.eventEmitter.subscribeOnMount({
		multiplierTotalShow: () => {
			show = true;
			popScale.set(1);
			flash.set(0);
		},
		multiplierTotalHide: () => (show = false),
		multiplierTotalUpdate: (emitterEvent) => (totalMultiplier = emitterEvent.totalMultiplier),
		multiplierTotalAnimate: async () => {
			flash.set(0.85, { duration: 110, easing: cubicOut });
			popScale.set(1.18, { duration: 150, easing: backOut });
			flash.set(0, { duration: 360, easing: cubicOut });
			popScale.set(1, { duration: 220, easing: backOut });
			await waitForTimeout(EXPLOSION_DURATION_MS / stateBetDerived.timeScale());
		},
	});

	const PANEL_W = SYMBOL_SIZE * 2.8;
	const PANEL_H = SYMBOL_SIZE * 1.25;

	// Symmetric starlight bloom behind the plaque — no offset shadow, so it stays
	// visually centred.
	const drawBurst = (g: import('pixi.js').Graphics) => {
		g.clear();
		const r = SYMBOL_SIZE * 1.8;
		g.circle(0, 0, r);
		g.fill({ color: 0xffffff, alpha: 0.36 });
		g.circle(0, 0, r * 1.5);
		g.fill({ color: 0xc9b3ff, alpha: 0.22 });
	};
</script>

{#if show}
	{@const board = context.stateGameDerived.boardLayout()}
	<BoardContainer>
		<Container x={board.width * 0.5} y={board.height * 0.5} scale={popScale.current}>
			<Graphics alpha={flash.current} draw={drawBurst} />
			<Graphics draw={(g) => drawVineWinPanel(g, PANEL_W, PANEL_H, { glow: true })} />
			<SilverText
				anchor={0.5}
				maxWidth={PANEL_W * 0.72}
				targetFontSize={PANEL_H * 0.52}
				text={`${totalMultiplier}X`}
			/>
		</Container>
	</BoardContainer>
{/if}
