// @ts-ignore
import config from 'config-svelte';

const base = config();

/** @type {import('@sveltejs/kit').Config} */
export default {
	...base,
	kit: {
		...base.kit,
		// Path aliases for the starpetal layer. Only our own files use these;
		// the vendored engine under src/game + src/components keeps relative imports.
		alias: {
			$starpetal: 'src/starpetal',
			$game: 'src/game',
			// Engine Pixi components the starpetal layer reuses (Symbol, BoardContainer, …).
			$components: 'src/components',
		},
	},
};
