<script lang="ts">
	import { type Snippet } from 'svelte';
	import { page } from '$app/state';
	import { GlobalStyle } from 'components-ui-html';
	import { Authenticate, LoaderStakeEngine, LoaderExample, LoadI18n } from 'components-shared';
	import Game from '../components/Game.svelte';
	import { setContext } from '../game/context';
	import * as starpetal from '$starpetal/bridge';

	import messagesMap from '../i18n/messagesMap';

	type Props = { children: Snippet };

	const props: Props = $props();

	let showYourLoader = $state(false);

	const loaderUrlStakeEngine = new URL('../../stake-engine-loader.gif', import.meta.url).href;
	const loaderUrl = new URL('../../loader.gif', import.meta.url).href;

	// Dev-only offline route: render the page (which mounts <Game/> without
	// <Authenticate>) and seed the minimal bet state. Production '/' is untouched.
	const isLocalPlay = $derived(page.url.pathname.startsWith('/play'));

	setContext();

	$effect(() => {
		if (isLocalPlay) starpetal.initRoute();
	});
</script>

{#if isLocalPlay}
	{@render props.children()}
{:else}
	<GlobalStyle>
		<Authenticate>
			<LoadI18n {messagesMap}>
				<Game />
			</LoadI18n>
		</Authenticate>
	</GlobalStyle>

	<LoaderStakeEngine src={loaderUrlStakeEngine} oncomplete={() => (showYourLoader = true)} />

	{#if showYourLoader}
		<LoaderExample src={loaderUrl} />
		<!-- '/loader.gif' is served from static folder of sveltekit -->
	{/if}

	{@render props.children()}
{/if}
