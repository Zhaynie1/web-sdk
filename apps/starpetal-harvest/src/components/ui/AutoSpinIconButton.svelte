<script lang="ts">
	import type { ButtonProps } from 'components-pixi';
	import { stateBet, stateBetDerived, stateModal } from 'state-shared';
	import { getContextEventEmitter } from 'utils-event-emitter';
	import { getContextXstate } from 'utils-xstate';
	import type { EmitterEventUi } from 'components-ui-pixi';

	import FooterIconButton from './FooterIconButton.svelte';
	import VineAutoSpinCounter from './VineAutoSpinCounter.svelte';

	type Props = Partial<Omit<ButtonProps, 'children'>> & {
		size?: number;
	};

	const props: Props = $props();
	const { eventEmitter } = getContextEventEmitter<EmitterEventUi>();
	const { stateXstateDerived } = getContextXstate();

	const active = $derived(stateBetDerived.hasAutoBetCounter());
	const disabled = $derived.by(() => {
		if (stateBet.isSpaceHold) return true;
		if (!stateXstateDerived.isIdle() && !stateBetDerived.hasAutoBetCounter()) return true;
		if (!stateBetDerived.isBetCostAvailable()) return true;
		return false;
	});

	const stopAutoSpin = () => (stateBet.autoSpinsCounter = 0);
	const openModal = () => (stateModal.modal = { name: 'autoSpin' });
	const onpress = () => {
		eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateBetDerived.hasAutoBetCounter() ? stopAutoSpin() : openModal();
	};
</script>

<FooterIconButton
	{...props}
	icon="autospin"
	{onpress}
	{disabled}
	{active}
	glow={active}
	overlay={autospinOverlay}
/>

{#snippet autospinOverlay()}
	<VineAutoSpinCounter />
{/snippet}