<script lang="ts">
	import type { ButtonProps } from 'components-pixi';
	import { stateUi } from 'state-shared';
	import { getContextEventEmitter } from 'utils-event-emitter';
	import type { EmitterEventUi } from 'components-ui-pixi';

	import FooterIconButton from './FooterIconButton.svelte';

	const props: Partial<Omit<ButtonProps, 'children'>> = $props();
	const { eventEmitter } = getContextEventEmitter<EmitterEventUi>();

	const onpress = () => {
		eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateUi.menuOpen = false;
	};
</script>

<FooterIconButton {...props} icon="exit" {onpress} />