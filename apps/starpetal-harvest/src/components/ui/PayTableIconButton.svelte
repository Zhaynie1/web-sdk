<script lang="ts">
	import type { ButtonProps } from 'components-pixi';
	import { stateModal } from 'state-shared';
	import { getContextEventEmitter } from 'utils-event-emitter';
	import type { EmitterEventUi } from 'components-ui-pixi';

	import FooterIconButton from './FooterIconButton.svelte';

	const props: Partial<Omit<ButtonProps, 'children'>> = $props();
	const { eventEmitter } = getContextEventEmitter<EmitterEventUi>();

	const onpress = () => {
		eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateModal.modal = { name: 'payTable' };
	};
</script>

<FooterIconButton {...props} icon="paytable" {onpress} />