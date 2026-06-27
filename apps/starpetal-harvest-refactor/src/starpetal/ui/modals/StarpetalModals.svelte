<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Popup } from 'components-shared';
	import { zIndex } from 'constants-shared/zIndex';
	import { stateModal } from 'state-shared';

	import BaseContent from 'components-ui-html/src/components/BaseContent.svelte';
	import BaseScrollable from 'components-ui-html/src/components/BaseScrollable.svelte';
	import ModalAutoSpin from 'components-ui-html/src/components/ModalAutoSpin.svelte';
	import ModalAutoSpinMessage from 'components-ui-html/src/components/ModalAutoSpinMessage.svelte';
	import ModalBetMenu from 'components-ui-html/src/components/ModalBetMenu.svelte';
	import ModalBuyBonus from 'components-ui-html/src/components/ModalBuyBonus.svelte';
	import ModalBuyBonusConfirm from 'components-ui-html/src/components/ModalBuyBonusConfirm.svelte';
	import ModalError from 'components-ui-html/src/components/ModalError.svelte';
	import ModalGameRules from 'components-ui-html/src/components/ModalGameRules.svelte';
	import ModalSettings from 'components-ui-html/src/components/ModalSettings.svelte';

	import PayTableContent from './PayTableContent.svelte';
	import GameRulesContent from './GameRulesContent.svelte';

	// Starpetal modal set: the engine's neutral modal chrome, but the paytable and
	// game-rules content come from the starpetal config (forest symbols + copy).
	// Buy-bonus uses the base modal for now (themed cards are later polish).
	type Props = { version: Snippet };
	const props: Props = $props();
</script>

<ModalError />
<ModalBetMenu />
<ModalBuyBonus />
<ModalBuyBonusConfirm />
<ModalAutoSpin />
<ModalAutoSpinMessage />

{#if stateModal.modal?.name === 'payTable'}
	<Popup zIndex={zIndex.modal} onclose={() => (stateModal.modal = null)}>
		<BaseContent maxWidth="100%">
			<BaseScrollable type="column">
				<PayTableContent />
			</BaseScrollable>
		</BaseContent>
	</Popup>
{/if}

<ModalGameRules>
	<GameRulesContent />
	{@render props.version()}
</ModalGameRules>
<ModalSettings />

<style lang="scss">
	:global(html) {
		font-size: 16px;

		@media screen and (max-width: 500px) {
			font-size: 50%;
		}
	}
</style>
