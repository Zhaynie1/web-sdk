<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { stateBet } from 'state-shared';
	import { numberToCurrencyString } from 'utils-shared/amount';
	import { i18nDerived } from 'components-ui-pixi';

	import SidebarAmount from './SidebarAmount.svelte';

	const balanceTween = new Tween(stateBet.balanceAmount);
	const label = $derived(i18nDerived.balance());
	const value = $derived(numberToCurrencyString(balanceTween.current));

	$effect(() => {
		balanceTween.set(stateBet.balanceAmount);
	});
</script>

<SidebarAmount {label} {value} />