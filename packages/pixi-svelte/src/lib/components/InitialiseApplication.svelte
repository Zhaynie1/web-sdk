<script lang="ts">
	import * as PIXI from 'pixi.js';
	import { onMount, onDestroy, type Snippet } from 'svelte';
	import { devicePixelRatio } from 'svelte/reactivity/window';

	import { getContextApp } from '../context.svelte';
	import { preloadFont } from '../utils.svelte';

	type Props = { children: Snippet };

	const props: Props = $props();
	const context = getContextApp();

	let wrap: HTMLDivElement;
	let initialised = $state(false);
	let initError = $state<string | null>(null);

	const showInitError = (message: string) => {
		initError = message;
		if (wrap) {
			wrap.innerHTML = `<p style="margin:0;padding:24px;color:#f4e8ff;font-family:system-ui,sans-serif;text-align:center;max-width:420px;line-height:1.5;">${message}</p>`;
		}
	};

	const initialiseApplication = async () => {
		PIXI.Assets.reset();

		await preloadFont();
		const initOptions = {
			autoDensity: true,
			backgroundAlpha: 0,
			hello: true,
			multiView: false,
			antialias: true,
			clearBeforeRender: true,
			powerPreference: 'high-performance' as const,
			resolution: devicePixelRatio.current,
			resizeTo: window,
		};

		const preferences = ['webgl', 'webgpu'] as const;

		for (const preference of preferences) {
			const application = new PIXI.Application<PIXI.Renderer<HTMLCanvasElement>>();

			try {
				await application.init({ ...initOptions, preference });
				context.stateApp.pixiApplication = application;
				wrap.appendChild(application.canvas);

				// to prevent that you can't scroll the page with touch on the canvas. https://github.com/pixijs/pixijs/issues/4824
				application.renderer.events.autoPreventDefault = false;
				application.renderer.canvas.style.touchAction = 'auto';
				return;
			} catch (error) {
				console.warn(`${preference.toUpperCase()} init failed`, error);
				application.destroy(true);
			}
		}

		throw new Error('Graphics failed to start (WebGL and WebGPU unavailable).');
	};

	onMount(async () => {
		try {
			if (!initialised) await initialiseApplication();
			initialised = true;
		} catch (error) {
			console.error(error);
			showInitError(
				'Could not start the game renderer. Try a hard refresh (Ctrl+Shift+R) or another browser.',
			);
		}
	});

	onDestroy(() => {
		if (context.stateApp.pixiApplication) {
			context.stateApp.pixiApplication.destroy();
		}
	});
</script>

<div bind:this={wrap}>
	{#if initialised}
		{@render props.children()}
	{/if}
</div>
