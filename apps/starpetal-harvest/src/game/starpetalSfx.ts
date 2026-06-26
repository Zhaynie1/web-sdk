import { stateBet, stateSoundDerived } from 'state-shared';

import { staticAssetUrl } from './staticAssetUrl';

const POOL_SIZE = 8;

const clusterConnectSrc = () => staticAssetUrl('assets/audio/starpetal_cluster_connect.m4a');
const totalWinNoiseSrc = () => staticAssetUrl('assets/audio/starpetal_total_win_noise.m4a');
const spinClickSrc = () => staticAssetUrl('assets/audio/starpetal_spin_click.mp3');
const reelStopSrc = () => staticAssetUrl('assets/audio/starpetal_reel_stop.m4a');

const createAudioPool = (src: () => string, size = POOL_SIZE) => {
	const pool: HTMLAudioElement[] = [];
	let preloaded = false;

	const preload = () => {
		if (preloaded) return;
		preloaded = true;
		const url = src();
		for (let index = 0; index < size; index += 1) {
			const audio = new Audio(url);
			audio.preload = 'auto';
			audio.load();
			pool.push(audio);
		}
	};

	const play = (volume: number) => {
		if (volume <= 0) return;

		preload();
		const url = src();
		const audio =
			pool.find((element) => element.paused || element.ended) ??
			(() => {
				const element = new Audio(url);
				pool.push(element);
				return element;
			})();

		if (audio.src !== url) {
			audio.src = url;
		}

		audio.volume = volume;

		const start = () => {
			audio.currentTime = 0;
			void audio.play().catch(() => {
				// Blocked until the player interacts with the page
			});
		};

		if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
			start();
			return;
		}

		audio.addEventListener('canplaythrough', start, { once: true });
		audio.load();
	};

	return { preload, play };
};

const clusterConnectPool = createAudioPool(clusterConnectSrc, POOL_SIZE);
const spinClickPool = createAudioPool(spinClickSrc, 4);
const reelStopPool = createAudioPool(reelStopSrc, POOL_SIZE);

let totalWinNoiseAudio: HTMLAudioElement | null = null;

const getEffectVolume = () => stateSoundDerived.volumeSoundEffect();

export const preloadSpinClickSound = () => {
	spinClickPool.preload();
};

export const preloadReelStopSound = () => {
	reelStopPool.preload();
};

/** Preload all custom starpetal SFX (no template sounds.json). */
export const preloadStarpetalSfx = () => {
	spinClickPool.preload();
	reelStopPool.preload();
	clusterConnectPool.preload();

	const noise = new Audio(totalWinNoiseSrc());
	noise.preload = 'auto';
	noise.load();
	totalWinNoiseAudio = noise;
};

export const playClusterConnectSound = () => {
	clusterConnectPool.play(getEffectVolume());
};

export const stopTotalWinNoise = () => {
	if (!totalWinNoiseAudio) return;

	totalWinNoiseAudio.pause();
	totalWinNoiseAudio.currentTime = 0;
};

export const playTotalWinNoise = () => {
	const volume = getEffectVolume();
	if (volume <= 0) return;

	stopTotalWinNoise();

	if (!totalWinNoiseAudio) {
		totalWinNoiseAudio = new Audio(totalWinNoiseSrc());
		totalWinNoiseAudio.loop = true;
		totalWinNoiseAudio.preload = 'auto';
		totalWinNoiseAudio.load();
	}

	totalWinNoiseAudio.volume = volume;
	totalWinNoiseAudio.currentTime = 0;
	void totalWinNoiseAudio.play().catch(() => {
		// Blocked until the player interacts with the page
	});
};

export const playReelStopSound = () => {
	if (stateBet.isTurbo) return;
	reelStopPool.play(getEffectVolume());
};

export const playSpinClickSound = () => {
	spinClickPool.play(getEffectVolume());
};