<script lang="ts">
	import { onMount } from 'svelte';
	import { Rectangle } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import { THEME } from '../game/theme';

	type Props = {
		oncomplete: () => void;
	};

	const props: Props = $props();
	const context = getContext();

	const sizes = $derived(context.stateLayoutDerived.canvasSizes());

	onMount(() => {
		const fadeMs = context.stateLayoutDerived.isStacked() ? 720 : 180;
		const timer = setTimeout(() => props.oncomplete(), fadeMs);
		return () => clearTimeout(timer);
	});
</script>

<Rectangle {...sizes} backgroundColor={THEME.bgDeep} backgroundAlpha={0.85} />