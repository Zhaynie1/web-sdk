<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { stateBet } from 'state-shared';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { i18nDerived } from 'components-ui-pixi';

	import SidebarAmount from './SidebarAmount.svelte';

	const winTween = new Tween(stateBet.winBookEventAmount);
	const label = $derived(i18nDerived.win());
	const value = $derived(bookEventAmountToCurrencyString(winTween.current));

	$effect(() => {
		winTween.set(stateBet.winBookEventAmount);
	});
</script>

<SidebarAmount {label} {value} />