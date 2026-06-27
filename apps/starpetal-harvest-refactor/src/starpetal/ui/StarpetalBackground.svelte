<script lang="ts">
	import { onMount } from 'svelte';
	import { stateSound, stateSoundDerived } from 'state-shared';

	import { stateGame } from '$game/stateGame.svelte';

	// Grove video background — a DOM layer behind the transparent Pixi canvas. Two
	// <video> copies crossfade near loop-end to hide the seam; a tint overlay marks
	// free spins. A subtle grove/bonus ambience loop (Web Audio, gap-crossfaded)
	// layers under the engine music and follows gameType.
	const VIDEO_SRC = '/starpetal/video/starpetal_grove_bg.mp4';
	const BASE_AMBIENCE_SRC = '/starpetal/audio/starpetal_grove_ambience.m4a';
	const BONUS_AMBIENCE_SRC = '/starpetal/audio/starpetal_bonus_ambience.m4a';
	const CROSSFADE_SEC = 1.4;
	/** Overlap each loop iteration to hide file gaps / loop-point clicks. */
	const AMBIENCE_LOOP_CROSSFADE_SEC = 1.2;

	type AmbienceLoopController = {
		sources: Set<AudioBufferSourceNode>;
		segmentGains: Set<GainNode>;
		timeoutId: ReturnType<typeof setTimeout> | null;
		stopped: boolean;
	};

	const isBaseGame = () => stateGame.gameType !== 'freegame';
	const isBonusGame = () => stateGame.gameType === 'freegame';
	const showBonusTint = $derived(stateGame.gameType === 'freegame');

	let videoA = $state<HTMLVideoElement | null>(null);
	let videoB = $state<HTMLVideoElement | null>(null);
	let audioEnabled = $state(false);
	let activeIsA = $state(true);
	let opacityA = $state(1);
	let opacityB = $state(0);

	let audioContext: AudioContext | null = null;
	let gainNode: GainNode | null = null;
	let baseAmbienceBuffer: AudioBuffer | null = null;
	let bonusAmbienceBuffer: AudioBuffer | null = null;
	let baseAmbienceLoop: AmbienceLoopController | null = null;
	let bonusAmbienceLoop: AmbienceLoopController | null = null;
	let crossfading = false;
	let fadeFrame = 0;

	const getActive = () => (activeIsA ? videoA : videoB);
	const getInactive = () => (activeIsA ? videoB : videoA);

	const syncVolume = () => {
		if (!gainNode) return;
		const volume = stateSoundDerived.volumeMusic();
		gainNode.gain.value = audioEnabled && volume > 0 ? volume : 0;
	};

	const stopSource = (source: AudioBufferSourceNode) => {
		try {
			source.stop();
		} catch {
			// Already stopped
		}
	};

	const createAmbienceLoopController = (): AmbienceLoopController => ({
		sources: new Set(),
		segmentGains: new Set(),
		timeoutId: null,
		stopped: true,
	});

	const stopAmbienceLoop = (controller: AmbienceLoopController | null) => {
		if (!controller || controller.stopped) return;

		controller.stopped = true;
		if (controller.timeoutId) clearTimeout(controller.timeoutId);
		controller.timeoutId = null;

		for (const source of controller.sources) stopSource(source);
		controller.sources.clear();

		for (const segmentGain of controller.segmentGains) {
			try {
				segmentGain.disconnect();
			} catch {
				// Already disconnected
			}
		}
		controller.segmentGains.clear();
	};

	const scheduleAmbienceLoopIteration = (
		controller: AmbienceLoopController,
		buffer: AudioBuffer,
		startAt: number,
		fadeIn: boolean,
	) => {
		if (controller.stopped || !audioContext || !gainNode) return;

		const crossfade = Math.min(AMBIENCE_LOOP_CROSSFADE_SEC, Math.max(0.2, buffer.duration * 0.2));
		const duration = buffer.duration;
		const segmentGain = audioContext.createGain();
		segmentGain.connect(gainNode);
		controller.segmentGains.add(segmentGain);

		const source = audioContext.createBufferSource();
		source.buffer = buffer;
		source.connect(segmentGain);
		controller.sources.add(source);

		if (fadeIn) {
			segmentGain.gain.setValueAtTime(0, startAt);
			segmentGain.gain.linearRampToValueAtTime(1, startAt + crossfade);
		} else {
			segmentGain.gain.setValueAtTime(1, startAt);
		}

		const fadeOutStart = Math.max(startAt + crossfade, startAt + duration - crossfade);
		segmentGain.gain.setValueAtTime(1, fadeOutStart);
		segmentGain.gain.linearRampToValueAtTime(0, startAt + duration);

		source.start(startAt);
		source.stop(startAt + duration);
		source.onended = () => {
			controller.sources.delete(source);
			controller.segmentGains.delete(segmentGain);
			try {
				segmentGain.disconnect();
			} catch {
				// Already disconnected
			}
		};

		const nextStartAt = startAt + duration - crossfade;
		const delayMs = Math.max(0, (nextStartAt - audioContext.currentTime) * 1000);
		controller.timeoutId = setTimeout(() => {
			if (controller.stopped || !audioContext) return;
			scheduleAmbienceLoopIteration(controller, buffer, audioContext.currentTime, true);
		}, delayMs);
	};

	const startAmbienceLoop = (
		controller: AmbienceLoopController | null,
		buffer: AudioBuffer | null,
	) => {
		if (!controller || !controller.stopped || !audioContext || !buffer || !gainNode) return;

		controller.stopped = false;
		scheduleAmbienceLoopIteration(controller, buffer, audioContext.currentTime, false);
		syncVolume();
	};

	const stopBaseAmbience = () => stopAmbienceLoop(baseAmbienceLoop);
	const stopBonusAmbience = () => stopAmbienceLoop(bonusAmbienceLoop);

	const startBaseAmbience = () => {
		if (!isBaseGame() || !baseAmbienceLoop || !baseAmbienceBuffer) return;
		startAmbienceLoop(baseAmbienceLoop, baseAmbienceBuffer);
	};

	const startBonusAmbience = () => {
		if (!isBonusGame() || !bonusAmbienceLoop || !bonusAmbienceBuffer) return;
		startAmbienceLoop(bonusAmbienceLoop, bonusAmbienceBuffer);
	};

	const loadAudioBuffer = async (src: string) => {
		const response = await fetch(src);
		const arrayBuffer = await response.arrayBuffer();
		return audioContext!.decodeAudioData(arrayBuffer);
	};

	const initAmbience = async () => {
		audioContext = new AudioContext();
		gainNode = audioContext.createGain();
		gainNode.connect(audioContext.destination);
		baseAmbienceLoop = createAmbienceLoopController();
		bonusAmbienceLoop = createAmbienceLoopController();

		[baseAmbienceBuffer, bonusAmbienceBuffer] = await Promise.all([
			loadAudioBuffer(BASE_AMBIENCE_SRC),
			loadAudioBuffer(BONUS_AMBIENCE_SRC),
		]);
	};

	const syncAmbienceForGameType = () => {
		if (!audioEnabled || !baseAmbienceBuffer || !bonusAmbienceBuffer) return;

		if (isBaseGame()) {
			stopBonusAmbience();
			if (baseAmbienceLoop?.stopped) {
				void audioContext?.resume().then(() => startBaseAmbience());
			} else {
				syncVolume();
			}
			return;
		}

		stopBaseAmbience();
		if (bonusAmbienceLoop?.stopped) {
			void audioContext?.resume().then(() => startBonusAmbience());
		} else {
			syncVolume();
		}
	};

	const tryPlayVideo = async () => {
		const active = getActive();
		if (!active) return;
		active.muted = true;
		try {
			await active.play();
		} catch {
			// Autoplay blocked until user interacts
		}
	};

	const startCrossfade = async () => {
		const active = getActive();
		const inactive = getInactive();
		if (!active || !inactive || crossfading) return;

		crossfading = true;
		inactive.currentTime = 0;
		inactive.muted = true;
		try {
			await inactive.play();
		} catch {
			crossfading = false;
			return;
		}

		const fromA = activeIsA ? 1 : 0;
		const toA = activeIsA ? 0 : 1;
		const start = performance.now();
		const durationMs = CROSSFADE_SEC * 1000;

		const tick = (now: number) => {
			const t = Math.min(1, (now - start) / durationMs);
			const eased = t * t * (3 - 2 * t);
			opacityA = fromA + (toA - fromA) * eased;
			opacityB = 1 - opacityA;

			if (t < 1) {
				fadeFrame = requestAnimationFrame(tick);
			} else {
				active.pause();
				active.currentTime = 0;
				activeIsA = !activeIsA;
				crossfading = false;
			}
		};

		cancelAnimationFrame(fadeFrame);
		fadeFrame = requestAnimationFrame(tick);
	};

	const onTimeUpdate = (event: Event) => {
		const active = getActive();
		const video = event.currentTarget as HTMLVideoElement;
		if (!active || video !== active || crossfading) return;
		if (!Number.isFinite(video.duration) || video.duration <= 0) return;
		if (video.duration - video.currentTime <= CROSSFADE_SEC) void startCrossfade();
	};

	const enableAudio = async () => {
		if (audioEnabled) return;
		audioEnabled = true;

		if (!baseAmbienceBuffer || !bonusAmbienceBuffer) await initAmbience();
		if (audioContext?.state === 'suspended') await audioContext.resume();

		syncAmbienceForGameType();
		void getActive()?.play();
	};

	onMount(() => {
		void initAmbience();
		void tryPlayVideo();

		const onInteract = () => void enableAudio();
		window.addEventListener('pointerdown', onInteract, { once: true });
		window.addEventListener('keydown', onInteract, { once: true });

		return () => {
			window.removeEventListener('pointerdown', onInteract);
			window.removeEventListener('keydown', onInteract);
			cancelAnimationFrame(fadeFrame);
			stopBaseAmbience();
			stopBonusAmbience();
			void audioContext?.close();
		};
	});

	$effect(() => {
		stateGame.gameType;
		stateSound.volumeValueMaster;
		stateSound.volumeValueMusic;
		syncAmbienceForGameType();
	});
</script>

<div class="grove-stage">
	<video
		bind:this={videoA}
		class="grove-video"
		style:opacity={opacityA}
		src={VIDEO_SRC}
		autoplay
		muted
		playsinline
		preload="auto"
		onloadeddata={() => activeIsA && tryPlayVideo()}
		ontimeupdate={onTimeUpdate}
	></video>
	<video
		bind:this={videoB}
		class="grove-video"
		style:opacity={opacityB}
		src={VIDEO_SRC}
		muted
		playsinline
		preload="auto"
		ontimeupdate={onTimeUpdate}
	></video>
	{#if showBonusTint}
		<div class="bonus-tint" aria-hidden="true"></div>
	{/if}
</div>

<style>
	.grove-stage {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.grove-video {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.bonus-tint {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			radial-gradient(circle at 50% 40%, rgb(255 158 207 / 10%), transparent 35%),
			linear-gradient(rgb(123 92 255 / 12%), rgb(123 92 255 / 12%));
	}
</style>
