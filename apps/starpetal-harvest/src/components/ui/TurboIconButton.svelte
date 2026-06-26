<script lang="ts">
	import type { ButtonProps } from 'components-pixi';
	import { stateBet, stateBetDerived } from 'state-shared';
	import { getContextEventEmitter } from 'utils-event-emitter';
	import type { EmitterEventUi } from 'components-ui-pixi';

	import FooterIconButton from './FooterIconButton.svelte';

	type Props = Partial<Omit<ButtonProps, 'children'>> & {
		size?: number;
	};

	const props: Props = $props();
	const { eventEmitter } = getContextEventEmitter<EmitterEventUi>();

	const active = $derived(stateBet.isTurbo);
	const disabled = $derived(stateBet.isSpaceHold);

	const onpress = () => {
		eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateBetDerived.updateIsTurbo(!stateBet.isTurbo, { persistent: true });
	};

	eventEmitter.subscribeOnMount({
		stopButtonClick: () => stateBetDerived.updateIsTurbo(true, { persistent: false }),
		stopButtonEnable: () => stateBetDerived.updateIsTurbo(false, { persistent: false }),
	});
</script>

<FooterIconButton
	{...props}
	icon="turbo"
	{onpress}
	{disabled}
	{active}
	glow={active}
/>