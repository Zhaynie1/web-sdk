<script lang="ts">
	import { getContextLayout } from 'utils-layout';

	import BoardContainer from './BoardContainer.svelte';
	import BottomCreditBet from './ui/BottomCreditBet.svelte';
	import { getSlotCreditBetBoardPosition } from '../game/layoutConstants';

	const { stateLayoutDerived } = getContextLayout();
	const isPortrait = $derived(stateLayoutDerived.layoutType() === 'portrait');
	const creditBetPos = getSlotCreditBetBoardPosition();
</script>

<BoardContainer>
	<BottomCreditBet
		x={creditBetPos.x}
		y={creditBetPos.y}
		labelFontSize={isPortrait ? 14 : 15}
		valueFontSize={isPortrait ? 20 : 22}
	/>
</BoardContainer>