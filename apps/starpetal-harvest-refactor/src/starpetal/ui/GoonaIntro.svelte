<script lang="ts">
	import { onMount } from 'svelte';
import { assetUrl } from '../config/assetUrl';

	// Goona Gaming studio intro — a full-screen video splash shown before the Starpetal
	// Forest loading screen. Plays once, then fades out to reveal the loading screen /
	// game. Tries to play with sound, falls back to muted autoplay (browser policy), and
	// can be skipped by tapping. Path is relative so it resolves on Stake too.
	type Props = { src?: string; oncomplete?: () => void };
	const props: Props = $props();
	const src = props.src ?? assetUrl('starpetal/video/starpetal_intro.mp4');

	let video = $state<HTMLVideoElement | null>(null);
	let visible = $state(true);
	let fading = $state(false);
	let done = false;

	const finish = () => {
		if (done) return;
		done = true;
		fading = true;
		setTimeout(() => {
			visible = false;
			props.oncomplete?.();
		}, 450);
	};

	onMount(() => {
		const v = video;
		if (!v) return finish();

		const tryPlay = async () => {
			try {
				v.muted = false;
				await v.play();
			} catch {
				try {
					v.muted = true;
					await v.play();
				} catch {
					finish();
				}
			}
		};
		void tryPlay();

		// Safety cap so a missing/stalled video can never block the game.
		const fallback = setTimeout(finish, 12000);
		v.addEventListener('ended', () => { clearTimeout(fallback); finish(); }, { once: true });
		v.addEventListener('error', () => { clearTimeout(fallback); finish(); }, { once: true });
		return () => clearTimeout(fallback);
	});
</script>

{#if visible}
	<div class="goona-intro" class:fading onpointerdown={finish} role="presentation">
		<!-- svelte-ignore a11y_media_has_caption -->
		<video bind:this={video} class="goona-video" {src} playsinline preload="auto"></video>
		<span class="skip">Tap to skip</span>
	</div>
{/if}

<style>
	.goona-intro {
		position: fixed;
		inset: 0;
		z-index: 10000;
		background: #000;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 1;
		transition: opacity 0.45s ease;
	}
	.goona-intro.fading {
		opacity: 0;
	}
	.goona-video {
		/* zoomed out: sit centred with margin around it, never cropped */
		max-width: 86%;
		max-height: 86%;
		width: auto;
		height: auto;
		object-fit: contain;
	}
	.skip {
		position: absolute;
		bottom: 18px;
		right: 20px;
		color: rgb(255 255 255 / 55%);
		font: 600 14px proxima-nova, sans-serif;
		pointer-events: none;
	}
</style>
