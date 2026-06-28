<script lang="ts">
	import { stateBet, stateModal, type BetModeData } from 'state-shared';
	import { getContextXstate } from 'utils-xstate';
	import { Button } from 'components-shared';
	import { getContextEventEmitter } from 'utils-event-emitter';
	import { numberToCurrencyString } from 'utils-shared/amount';

	import BaseIcon from 'components-ui-html/src/components/BaseIcon.svelte';
	import BonusCard from 'components-ui-html/src/components/BonusCard.svelte';
	import BaseButtonContent from 'components-ui-html/src/components/BaseButtonContent.svelte';
	import { stateBonus } from 'components-ui-html/src/stateBonus.svelte';
	import type { EmitterEventModal } from 'components-ui-html/src/types';

	import { getBonusBuyCardCopy } from '$starpetal/config/bonusBuyCopy';

	type Props = {
		list: BetModeData[];
	};

	const props: Props = $props();
	const { eventEmitter } = getContextEventEmitter<EmitterEventModal>();
	const { stateXstateDerived } = getContextXstate();
	const spinBusy = $derived(!stateXstateDerived.isIdle());
</script>

{#each props.list as betModeData}
	{#if betModeData.type !== 'default'}
		{@const cardCopy = getBonusBuyCardCopy(betModeData.mode)}
		<BonusCard>
			{#snippet title()}
				<div class="title">
					{cardCopy?.title ?? betModeData.text.title}
				</div>
			{/snippet}

			{#snippet description()}
				{#if cardCopy?.description ?? betModeData?.text?.description}
					<div class="description">
						{cardCopy?.description ?? betModeData.text.description}
					</div>
				{/if}
			{/snippet}

			{#snippet price()}
				<div class="price">
					{`${numberToCurrencyString(stateBet.betAmount * betModeData.costMultiplier)}`}
				</div>
			{/snippet}

			{#snippet button()}
				<Button
					onclick={() => {
						stateBonus.selectedBetModeKey = betModeData.mode;
						if (betModeData.type === 'buy') {
							stateBet.activeBetModeKey = betModeData.mode;
							eventEmitter.broadcast({ type: 'bet' });
							stateModal.modal = null;
						} else {
							eventEmitter.broadcast({ type: 'buyBonusConfirm' });
						}
						eventEmitter.broadcast({ type: 'soundPressGeneral' });
					}}
					disabled={spinBusy ||
						stateBet.betAmount <= 0 ||
						stateBet.balanceAmount < stateBet.betAmount * betModeData.costMultiplier}
				>
					<BaseIcon width="100%" height="2rem" border="2px solid white;" />
					<BaseButtonContent>
						<span style="font-size: 1rem;">{betModeData.text.button}</span>
					</BaseButtonContent>
				</Button>
			{/snippet}
		</BonusCard>
	{/if}
{/each}

<style lang="scss">
	.title {
		font-size: 0.9rem;
		line-height: 1.15rem;
		text-align: center;
	}

	.description {
		font-size: 0.78rem;
		line-height: 1.1rem;
		text-align: center;
		min-height: 4.5rem;
		white-space: pre-line;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
	}

	.description:empty {
		display: none;
	}

	.price {
		font-size: 1rem;
		line-height: 1rem;
		text-align: center;
		white-space: nowrap;
	}

	:global(.bonus-card-wrap) {
		min-width: 168px;
		max-width: 210px;
	}
</style>
