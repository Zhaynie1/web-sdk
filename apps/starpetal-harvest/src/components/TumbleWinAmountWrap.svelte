<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Container } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';

	import { getContext } from '../game/context';
	import {
		getTumbleWinAmountDesktopPosition,
		getTumbleWinAmountScale,
		getTumbleWinAmountStackedPosition,
	} from '../game/layoutConstants';
	import BoardContainer from './BoardContainer.svelte';

	type Props = {
		show: boolean;
		children: Snippet;
	};

	const props: Props = $props();
	const context = getContext();

	const isStacked = $derived(context.stateLayoutDerived.isStacked());

	const position = $derived(
		isStacked
			? getTumbleWinAmountStackedPosition(context.stateGame.gameType)
			: getTumbleWinAmountDesktopPosition(),
	);

	const scale = $derived(getTumbleWinAmountScale(isStacked));
</script>

<FadeContainer show={props.show}>
	<BoardContainer>
		<Container {...position} {scale}>
			{@render props.children()}
		</Container>
	</BoardContainer>
</FadeContainer>
