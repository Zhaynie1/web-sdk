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
	import ModalBuyBonusConfirm from 'components-ui-html/src/components/ModalBuyBonusConfirm.svelte';
	import ModalError from 'components-ui-html/src/components/ModalError.svelte';
	import ModalGameRules from 'components-ui-html/src/components/ModalGameRules.svelte';

	import StarpetalModalSettings from './StarpetalModalSettings.svelte';
	import StarpetalModalBuyBonus from './StarpetalModalBuyBonus.svelte';
	import PayTableContent from './PayTableContent.svelte';
	import GameRulesContent from './GameRulesContent.svelte';

	// Starpetal modal set: the engine's neutral modal chrome, but the paytable,
	// game-rules content, and buy-bonus cards come from the starpetal config
	// (forest symbols + the three themed bonus buys).
	type Props = { version: Snippet };
	const props: Props = $props();
</script>

<ModalError />
<ModalBetMenu />
<StarpetalModalBuyBonus />
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
<StarpetalModalSettings />

<style lang="scss">
	:global(html) {
		/* Bumped so the modals read larger / easier (was 16px desktop, 50%≈8px mobile,
		 * which made the Auto Spin and Buy Bonus panels tiny on phones/popouts). */
		font-size: 20px;

		@media screen and (max-width: 500px) {
			font-size: 80%;
		}
	}

	/* Bounded, scrollable column — `BaseScrollable type="column"` adds `.scrollY` but the
	 * shared component ships no CSS for it, so tall content (the paytable on mobile, long
	 * auto-spin panels) overflowed with no way to scroll. Cap the height and scroll. */
	:global(.content.scrollY) {
		max-height: 80vh !important;
		overflow-y: auto !important;
		overflow-x: hidden;
		-webkit-overflow-scrolling: touch;
		padding-right: 2px;
	}

	/* ── Starpetal modal theme (twilight grove) ─────────────────────────────────
	 * Restyles the shared HTML modal primitives so the Buy Bonus and Auto Spin panels
	 * match the slot instead of the neutral engine chrome. The button / option boxes are
	 * all `.rectangle` (BaseIcon); their inline border encodes selection — white for the
	 * selected / primary buttons, black for unselected — so we key off that to keep the
	 * selection feedback while recolouring everything. */

	/* Buy-bonus card — the panel "where the words are" */
	:global(.bonus-card-wrap) {
		background: linear-gradient(180deg, #1b1438 0%, #0a0618 100%) !important;
		border: 1.5px solid rgba(157, 122, 255, 0.5) !important;
		border-radius: 12px !important;
		box-shadow:
			0 6px 20px rgba(0, 0, 0, 0.5),
			inset 0 1px 0 rgba(244, 232, 255, 0.1) !important;
		color: #f4e8ff;
	}

	/* All button / option boxes */
	:global(.rectangle) {
		border-radius: 10px;
		background: linear-gradient(180deg, #4a2f7d 0%, #2a1c47 100%) !important;
		box-shadow:
			inset 0 1px 0 rgba(244, 232, 255, 0.25),
			0 2px 6px rgba(0, 0, 0, 0.4) !important;
	}
	/* unselected (inline border was black) */
	:global(.rectangle[style*='black']) {
		background: linear-gradient(180deg, #241a3f 0%, #140f2c 100%) !important;
		border: 1.5px solid rgba(157, 122, 255, 0.35) !important;
	}
	/* selected / primary buy button (inline border was white) — listed last so it wins
	 * for boxes whose inline style contains both colours */
	:global(.rectangle[style*='white']) {
		background: linear-gradient(180deg, #7b5cff 0%, #4a2f7d 100%) !important;
		border: 2px solid #f4e8ff !important;
		box-shadow:
			0 0 12px rgba(157, 122, 255, 0.7),
			inset 0 1px 0 rgba(244, 232, 255, 0.4) !important;
	}

	/* button label text */
	:global(.button) {
		color: #f4e8ff;
	}

	/* modal titles */
	:global(.ui-modal-title-wrap) {
		color: #f4e8ff;
		text-shadow: 0 0 12px rgba(157, 122, 255, 0.6);
		font-weight: 800;
		letter-spacing: 0.04em;
	}
</style>
