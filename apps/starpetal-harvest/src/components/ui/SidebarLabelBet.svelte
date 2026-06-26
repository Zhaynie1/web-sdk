<script lang="ts">
	import { Container } from 'pixi-svelte';
	import { stateBetDerived, stateModal } from 'state-shared';
	import { numberToCurrencyString } from 'utils-shared/amount';
	import { getContextEventEmitter } from 'utils-event-emitter';
	import { getContextXstate } from 'utils-xstate';
	import { i18nDerived } from 'components-ui-pixi';
	import type { EmitterEventUi } from 'components-ui-pixi';

	import SidebarAmount from './SidebarAmount.svelte';

	const { eventEmitter } = getContextEventEmitter<EmitterEventUi>();
	const { stateXstateDerived } = getContextXstate();
	const label = $derived(stateBetDerived.activeBetMode()?.text.betAmountLabel || i18nDerived.bet());
	const value = $derived(numberToCurrencyString(stateBetDerived.betCost()));
	const disabled = $derived(!stateXstateDerived.isIdle());

	const onpress = () => {
		if (disabled) return;
		eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateModal.modal = { name: 'betAmountMenu' };
	};
</script>

<Container eventMode="static" cursor={disabled ? 'not-allowed' : 'pointer'} onpointerup={onpress}>
	<SidebarAmount {label} {value} />
</Container>