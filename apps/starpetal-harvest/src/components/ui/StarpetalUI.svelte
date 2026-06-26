<script lang="ts">
	import type { Snippet } from 'svelte';

	import { EnableSpaceHold } from 'components-shared';
	import { waitForFadeComplete } from '../../game/panelWait';
	import { FadeContainer } from 'components-pixi';
	import SpinButton from './SpinButton.svelte';
	import AutoSpinIconButton from './AutoSpinIconButton.svelte';
	import TurboIconButton from './TurboIconButton.svelte';
	import BetAdjustButton from './BetAdjustButton.svelte';
	import MenuIconButton from './MenuIconButton.svelte';
	import GameRulesIconButton from './GameRulesIconButton.svelte';
	import MenuCloseIconButton from './MenuCloseIconButton.svelte';
	import PayTableIconButton from './PayTableIconButton.svelte';
	import VolumeIconButton from './VolumeIconButton.svelte';
	import BonusBuyIconButton from './BonusBuyIconButton.svelte';
	import { getContextEventEmitter } from 'utils-event-emitter';
	import type { EmitterEventUi } from 'components-ui-pixi';

	import LayoutLeftColumn from './LayoutLeftColumn.svelte';
	import LayoutBottomBar from './LayoutBottomBar.svelte';

	type Props = {
		gameName?: Snippet;
		logo?: Snippet;
	};

	const props: Props = $props();
	const { eventEmitter } = getContextEventEmitter<EmitterEventUi>();

	let show = $state(true);
	let oncomplete = $state(() => {});

	eventEmitter.subscribeOnMount({
		uiShow: async () => {
			if (show === false) {
				show = true;
				await waitForFadeComplete((resolve) => (oncomplete = resolve));
			}
		},
		uiHide: async () => {
			if (show === true) {
				show = false;
				await waitForFadeComplete((resolve) => (oncomplete = resolve));
			}
		},
	});
</script>

<EnableSpaceHold />

<FadeContainer persistent {show} {oncomplete}>
	<LayoutLeftColumn>
		{#snippet gameName()}
			{@render props.gameName?.()}
		{/snippet}

		{#snippet logo()}
			{@render props.logo?.()}
		{/snippet}

		{#snippet amountBalance()}{/snippet}
		{#snippet amountWin()}{/snippet}
		{#snippet amountBet()}{/snippet}
		{#snippet buttonBuyBonus(buttonProps)}
			<BonusBuyIconButton {...buttonProps} />
		{/snippet}

		{#snippet buttonBet(buttonProps)}
			<SpinButton {...buttonProps} />
		{/snippet}

		{#snippet buttonTurbo(buttonProps)}
			<TurboIconButton {...buttonProps} />
		{/snippet}

		{#snippet buttonAutoSpin(buttonProps)}
			<AutoSpinIconButton {...buttonProps} />
		{/snippet}

		{#snippet buttonIncrease(buttonProps)}
			<BetAdjustButton direction="increase" {...buttonProps} />
		{/snippet}

		{#snippet buttonDecrease(buttonProps)}
			<BetAdjustButton direction="decrease" {...buttonProps} />
		{/snippet}

		{#snippet buttonMenu(buttonProps)}
			<MenuIconButton {...buttonProps} />
		{/snippet}

		{#snippet buttonMenuClose(buttonProps)}
			<MenuCloseIconButton {...buttonProps} />
		{/snippet}

		{#snippet buttonPayTable(buttonProps)}
			<PayTableIconButton {...buttonProps} />
		{/snippet}

		{#snippet buttonGameRules(buttonProps)}
			<GameRulesIconButton {...buttonProps} />
		{/snippet}

		{#snippet buttonSettings()}{/snippet}

		{#snippet buttonSoundSwitch(buttonProps)}
			<VolumeIconButton {...buttonProps} />
		{/snippet}
	</LayoutLeftColumn>

	<LayoutBottomBar>
		{#snippet gameName()}{/snippet}
		{#snippet logo()}{/snippet}
		{#snippet amountBalance()}{/snippet}
		{#snippet amountWin()}{/snippet}
		{#snippet amountBet()}{/snippet}
		{#snippet buttonBuyBonus(buttonProps)}
			<BonusBuyIconButton {...buttonProps} />
		{/snippet}
		{#snippet buttonBet(buttonProps)}
			<SpinButton {...buttonProps} />
		{/snippet}
		{#snippet buttonTurbo(buttonProps)}
			<TurboIconButton {...buttonProps} />
		{/snippet}
		{#snippet buttonAutoSpin(buttonProps)}
			<AutoSpinIconButton {...buttonProps} />
		{/snippet}
		{#snippet buttonIncrease(buttonProps)}
			<BetAdjustButton direction="increase" {...buttonProps} />
		{/snippet}
		{#snippet buttonDecrease(buttonProps)}
			<BetAdjustButton direction="decrease" {...buttonProps} />
		{/snippet}
		{#snippet buttonMenu(buttonProps)}
			<MenuIconButton {...buttonProps} />
		{/snippet}
		{#snippet buttonMenuClose(buttonProps)}
			<MenuCloseIconButton {...buttonProps} />
		{/snippet}
		{#snippet buttonPayTable(buttonProps)}
			<PayTableIconButton {...buttonProps} />
		{/snippet}
		{#snippet buttonGameRules(buttonProps)}
			<GameRulesIconButton {...buttonProps} />
		{/snippet}
		{#snippet buttonSettings()}{/snippet}
		{#snippet buttonSoundSwitch(buttonProps)}
			<VolumeIconButton {...buttonProps} />
		{/snippet}
	</LayoutBottomBar>
</FadeContainer>