<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Container } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';

	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';
	import BoardContainer from './BoardContainer.svelte';

	type Props = {
		show: boolean;
		children: Snippet;
	};

	const props: Props = $props();
	const context = getContext();

	// Sit fully above the top reel row so the plaque doesn't overlap the symbols.
	const desktopPosition = $derived({
		x: context.stateGameDerived.boardLayout().width * 0.5,
		y: -SYMBOL_SIZE * 0.8,
	});

	const portraitPosition = $derived({
		x:
			context.stateGameDerived.boardLayout().width *
			(context.stateGame.gameType === 'basegame' ? 0.5 : 0.37),
		y: -SYMBOL_SIZE * 1.0,
	});

	const position = $derived(
		context.stateLayoutDerived.isStacked() ? portraitPosition : desktopPosition,
	);

	const scale = $derived(context.stateLayoutDerived.isStacked() ? 1.28 : 1);
</script>

<FadeContainer show={props.show}>
	<BoardContainer>
		<Container {...position} {scale}>
			{@render props.children()}
		</Container>
	</BoardContainer>
</FadeContainer>
