<script lang="ts">
	import { onMount } from 'svelte';

	import { staticAssetUrl } from '../game/staticAssetUrl';

	type Props = {
		oncomplete: () => void;
	};

	const props: Props = $props();

	const INTRO_SRC = staticAssetUrl('assets/video/starpetal_intro.mp4');
	const PLAYBACK_RATE = 1.6;

	let videoEl = $state<HTMLVideoElement | null>(null);
	let started = $state(false);
	let completed = $state(false);

	const finish = () => {
		if (completed) return;
		completed = true;
		videoEl?.pause();
		props.oncomplete();
	};

	const tryPlay = async () => {
		if (!videoEl || started) return;
		videoEl.playbackRate = PLAYBACK_RATE;
		started = true;
		try {
			await videoEl.play();
		} catch {
			// Autoplay blocked — user can tap to play
			started = false;
		}
	};

	onMount(() => {
		void tryPlay();
		const fallback = window.setTimeout(() => finish(), 12_000);
		return () => window.clearTimeout(fallback);
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="intro" onclick={finish} role="presentation">
	<video
		bind:this={videoEl}
		class="intro-video"
		src={INTRO_SRC}
		playsinline
		muted
		preload="auto"
		onloadeddata={() => tryPlay()}
		onerror={finish}
		onended={finish}
	></video>
	<p class="skip-hint">Tap to skip</p>
</div>

<style>
	.intro {
		position: fixed;
		inset: 0;
		z-index: 100010;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #000;
		cursor: pointer;
	}

	.intro-video {
		max-width: 62%;
		max-height: 62%;
		width: auto;
		height: auto;
		object-fit: contain;
	}

	.skip-hint {
		position: absolute;
		bottom: 32px;
		margin: 0;
		color: rgba(255, 255, 255, 0.55);
		font-family: system-ui, sans-serif;
		font-size: 14px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		pointer-events: none;
	}
</style>