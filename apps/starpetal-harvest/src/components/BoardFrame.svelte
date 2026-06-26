<script lang="ts" module>
	export type EmitterEventBoardFrame =
		| { type: 'boardFrameGlowShow' }
		| { type: 'boardFrameGlowHide' };
</script>

<script lang="ts">
	import { Graphics } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import { BOARD_FRAME_INSET, BOARD_FRAME_WIDTH_SCALE } from '../game/boardInnerFrame';
	import { drawVineReelFrameBorder } from '../game/drawVineReelFrame';
	import { THEME } from '../game/theme';

	const context = getContext();

	let glow = $state(false);

	context.eventEmitter.subscribeOnMount({
		boardFrameGlowShow: () => {
			glow = true;
		},
		boardFrameGlowHide: () => {
			glow = false;
		},
	});

	const board = $derived(context.stateGameDerived.boardLayout());
	const x = $derived(board.x);
	const y = $derived(board.y);
	const w = $derived(board.width * BOARD_FRAME_WIDTH_SCALE);
	const h = $derived(board.height);
	const peakH = $derived(14);
	const frameInset = $derived(BOARD_FRAME_INSET);
	const innerW = $derived(w - frameInset * 2);
	const innerH = $derived(h - frameInset * 2);
</script>

<Graphics
	zIndex={-1}
	{x}
	{y}
	draw={(g) => {
		g.clear();
		const hw = w / 2;
		const hh = h / 2;
		const innerHw = innerW / 2;
		const innerHh = innerH / 2;

		if (glow) {
			g.roundRect(-hw - 8, -hh - 8, w + 16, h + 16, 18);
			g.fill({ color: THEME.frameGlow, alpha: 0.25 });
		}

		g.moveTo(-hw, -hh);
		g.lineTo(0, -hh - peakH);
		g.lineTo(hw, -hh);
		g.lineTo(hw, hh);
		g.lineTo(0, hh + peakH);
		g.lineTo(-hw, hh);
		g.closePath();
		g.fill({ color: THEME.bgGlow, alpha: 0.16 });

		// Square tint — full inner reel frame, grove still faintly visible
		g.rect(-innerHw, -innerHh, innerW, innerH);
		g.fill({ color: THEME.bgMid, alpha: 0.5 });
		g.rect(-innerHw, -innerHh, innerW, innerH);
		g.fill({ color: THEME.bgGlow, alpha: 0.3 });

		drawVineReelFrameBorder(g, {
			hw,
			hh,
			peakH,
			frameInset,
			innerHw,
			innerHh,
			innerW,
			innerH,
			glow,
		});
	}}
/>