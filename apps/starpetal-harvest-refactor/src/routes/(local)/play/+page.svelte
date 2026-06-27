<script lang="ts">
	import { GlobalStyle } from 'components-ui-html';
	import { LoadI18n } from 'components-shared';

	import Game from '../../../components/Game.svelte';
	import messagesMap from '../../../i18n/messagesMap';
</script>

<GlobalStyle>
	<LoadI18n {messagesMap}>
		<Game />
	</LoadI18n>
</GlobalStyle>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		min-height: 100%;
		background: #000;
	}
</style>
