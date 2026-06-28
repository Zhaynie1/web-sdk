import { stateBet, stateSoundDerived } from 'state-shared';
import { assetUrl } from '../config/assetUrl';

/**
 * Bespoke starpetal sound effects (spin click, reel stop, cluster connect, and
 * the looping total-win noise). The original app layered these over — and in
 * places instead of — the engine's template sounds.json cues. Served as plain
 * files from static/starpetal/audio (no sounds.json registry), played through a
 * small HTMLAudio pool so rapid repeats (reel stops) don't cut each other off.
 *
 * Volume follows the SFX channel (stateSoundDerived.volumeSoundEffect), so the
 * bottom-bar mute / settings sliders affect these too.
 */
const POOL_SIZE = 8;

const clusterConnectSrc = () => assetUrl('starpetal/audio/starpetal_cluster_connect.m4a');
const totalWinNoiseSrc = () => assetUrl('starpetal/audio/starpetal_total_win_noise.m4a');
const spinClickSrc = () => assetUrl('starpetal/audio/starpetal_spin_click.mp3');

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

let totalWinNoiseAudio: HTMLAudioElement | null = null;

const getEffectVolume = () => stateSoundDerived.volumeSoundEffect();

/** Preload all custom starpetal SFX (no template sounds.json). */
export const preloadStarpetalSfx = () => {
	spinClickPool.preload();
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

// Bespoke reel-drop "settle" — a soft, warm pluck with a short downward pitch glide and
// a little per-drop variation, so the reels land with a natural grove tap instead of the
// template metallic clank. Synthesized via Web Audio (no asset), routed through the SFX
// volume, and turbo-guarded like before.
export const playReelStopSound = () => {
	if (stateBet.isTurbo) return;

	const volume = getEffectVolume();
	if (volume <= 0) return;

	const ctx = getChimeCtx();
	if (!ctx) return;

	const now = ctx.currentTime;
	const out = ctx.createGain();
	out.gain.value = Math.min(1, volume) * 0.2; // subtle — fires once per reel
	out.connect(ctx.destination);

	const base = 200 + Math.random() * 36; // soft and woody, slight organic variation

	const tone = ctx.createOscillator();
	tone.type = 'sine';
	tone.frequency.setValueAtTime(base * 1.4, now);
	tone.frequency.exponentialRampToValueAtTime(base, now + 0.08);

	const body = ctx.createOscillator();
	body.type = 'triangle';
	body.frequency.value = base * 2;
	const bodyGain = ctx.createGain();
	bodyGain.gain.value = 0.08;

	const env = ctx.createGain();
	env.gain.setValueAtTime(0.0001, now);
	env.gain.exponentialRampToValueAtTime(1, now + 0.006); // quick soft attack
	env.gain.exponentialRampToValueAtTime(0.0001, now + 0.2); // short decay

	tone.connect(env);
	body.connect(bodyGain);
	bodyGain.connect(env);
	env.connect(out);

	tone.start(now);
	body.start(now);
	tone.stop(now + 0.24);
	body.stop(now + 0.24);
};

export const playSpinClickSound = () => {
	spinClickPool.play(getEffectVolume());
};

// Bonus-entry chime — a soft, synthesized ascending arpeggio (pure sine tones with a
// quiet octave shimmer, gentle attack + long decay). Deliberately not a slot-machine
// fanfare: just a calm set of chimes when a bonus begins. Built with Web Audio so we
// don't need an audio asset, and routed through the SFX volume.
let chimeCtx: AudioContext | null = null;

const getChimeCtx = (): AudioContext | null => {
	if (typeof window === 'undefined') return null;
	const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
	if (!Ctor) return null;
	if (!chimeCtx) chimeCtx = new Ctor();
	if (chimeCtx.state === 'suspended') void chimeCtx.resume();
	return chimeCtx;
};

export const playBonusEntryChime = () => {
	const volume = getEffectVolume();
	if (volume <= 0) return;

	const ctx = getChimeCtx();
	if (!ctx) return;

	const now = ctx.currentTime;
	const master = ctx.createGain();
	master.gain.value = Math.min(1, volume) * 0.28; // overall soft
	master.connect(ctx.destination);

	// C major pentatonic, ascending — wind-chime-like, no harsh intervals.
	const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
	const step = 0.11; // stagger between chimes
	const attack = 0.02;
	const release = 1.5;

	notes.forEach((freq, index) => {
		const start = now + index * step;
		const end = start + attack + release;

		const gain = ctx.createGain();
		gain.gain.setValueAtTime(0.0001, start);
		gain.gain.exponentialRampToValueAtTime(0.8, start + attack);
		gain.gain.exponentialRampToValueAtTime(0.0001, end);
		gain.connect(master);

		const osc = ctx.createOscillator();
		osc.type = 'sine';
		osc.frequency.value = freq;
		osc.connect(gain);

		// quiet octave partial for a bell-like shimmer
		const shimmer = ctx.createOscillator();
		shimmer.type = 'sine';
		shimmer.frequency.value = freq * 2;
		const shimmerGain = ctx.createGain();
		shimmerGain.gain.value = 0.12;
		shimmer.connect(shimmerGain);
		shimmerGain.connect(gain);

		osc.start(start);
		shimmer.start(start);
		osc.stop(end + 0.05);
		shimmer.stop(end + 0.05);
	});
};

// Cluster-highlight shimmer — a soft, brief sparkle (a high sine with a tiny upward
// glide + a quiet fifth) when a winning cluster lights up, replacing the template
// metallic "winlevel" clank. Gentle, since it can fire several times per cascade.
export const playClusterHighlightSound = () => {
	const volume = getEffectVolume();
	if (volume <= 0) return;

	const ctx = getChimeCtx();
	if (!ctx) return;

	const now = ctx.currentTime;
	const out = ctx.createGain();
	out.gain.value = Math.min(1, volume) * 0.16;
	out.connect(ctx.destination);

	const base = 1046.5; // C6 — bright but soft

	const tone = ctx.createOscillator();
	tone.type = 'sine';
	tone.frequency.setValueAtTime(base * 0.94, now);
	tone.frequency.exponentialRampToValueAtTime(base * 1.06, now + 0.08); // tiny upward shimmer

	const partial = ctx.createOscillator();
	partial.type = 'sine';
	partial.frequency.value = base * 1.5; // soft fifth
	const partialGain = ctx.createGain();
	partialGain.gain.value = 0.1;

	const env = ctx.createGain();
	env.gain.setValueAtTime(0.0001, now);
	env.gain.exponentialRampToValueAtTime(1, now + 0.008);
	env.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

	tone.connect(env);
	partial.connect(partialGain);
	partialGain.connect(env);
	env.connect(out);

	tone.start(now);
	partial.start(now);
	tone.stop(now + 0.36);
	partial.stop(now + 0.36);
};

// One unified win celebration for every win level (nice / big / super / etc.) — a warm
// major chord struck together with a soft attack and long, gentle decay. On theme and
// the same for all levels, replacing the per-level template win jingles.
export const playWinCelebration = () => {
	const volume = getEffectVolume();
	if (volume <= 0) return;

	const ctx = getChimeCtx();
	if (!ctx) return;

	const now = ctx.currentTime;
	const master = ctx.createGain();
	master.gain.value = Math.min(1, volume) * 0.3;
	master.connect(ctx.destination);

	const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C — major, resolved
	const attack = 0.015;
	const release = 1.3;

	notes.forEach((freq, index) => {
		const gain = ctx.createGain();
		const peak = 0.7 - index * 0.08; // upper notes a touch quieter
		gain.gain.setValueAtTime(0.0001, now);
		gain.gain.exponentialRampToValueAtTime(peak, now + attack);
		gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + release);
		gain.connect(master);

		const osc = ctx.createOscillator();
		osc.type = 'sine';
		osc.frequency.value = freq;
		osc.connect(gain);

		const shimmer = ctx.createOscillator();
		shimmer.type = 'sine';
		shimmer.frequency.value = freq * 2;
		const shimmerGain = ctx.createGain();
		shimmerGain.gain.value = 0.08;
		shimmer.connect(shimmerGain);
		shimmerGain.connect(gain);

		osc.start(now);
		shimmer.start(now);
		osc.stop(now + attack + release + 0.05);
		shimmer.stop(now + attack + release + 0.05);
	});
};
