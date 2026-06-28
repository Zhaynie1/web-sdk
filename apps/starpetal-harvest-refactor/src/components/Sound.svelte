<script lang="ts" module>
	import { sound, type MusicName, type SoundEffectName, type SoundName } from '../game/sound';

	export type EmitterEventSound =
		| { type: 'soundMusic'; name: MusicName }
		| { type: 'soundOnce'; name: SoundEffectName; forcePlay?: boolean }
		| { type: 'soundLoop'; name: SoundEffectName }
		| { type: 'soundStop'; name: SoundName }
		| { type: 'soundFade'; name: SoundName; from: number; to: number; duration: number }
		| { type: 'soundScatterCounterIncrease' }
		| { type: 'soundScatterCounterClear' }
		| { type: 'soundClusterConnect' }
		| { type: 'soundClusterHighlight' }
		| { type: 'soundBonusEntry' }
		| { type: 'soundWinCelebration' };
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	import { getContext } from '../game/context';
	import {
		playSpinClickSound,
		playReelStopSound,
		playClusterConnectSound,
		playClusterHighlightSound,
		playBonusEntryChime,
		playWinCelebration,
		preloadStarpetalSfx,
	} from '$starpetal/features/sfx';

	const context = getContext();

	context.eventEmitter.subscribeOnMount({
		// ui
		soundBetMode: async ({ betModeKey }) => {
			// Background music is suppressed — the grove/bonus ambience
			// (StarpetalBackground) is the soundtrack. Keep the bet-mode SFX cue.
			if (betModeKey === 'SUPERSPIN') {
				sound.players.once.play({ name: 'sfx_winlevel_end' });
			}
		},
		soundPressGeneral: () => sound.players.once.play({ name: 'sfx_btn_general' }),
		// Bespoke starpetal spin click instead of the template sfx_btn_spin.
		soundPressBet: () => playSpinClickSound(),
		// scatterCounter
		soundScatterCounterIncrease: () => (context.stateGame.scatterCounter = context.stateGame.scatterCounter + 1), // prettier-ignore
		soundScatterCounterClear: () => (context.stateGame.scatterCounter = 0),
		// Bespoke starpetal cluster-pop sound, restoring the original's pop cue.
		soundClusterConnect: () => playClusterConnectSound(),
		// Soft shimmer when a winning cluster highlights (replaces the template clank).
		soundClusterHighlight: () => playClusterHighlightSound(),
		// One unified win celebration for all win levels (replaces per-level jingles).
		soundWinCelebration: () => playWinCelebration(),
		// Soft synthesized chime on bonus entry (replaces the template free-spin jingle).
		soundBonusEntry: () => playBonusEntryChime(),
		// game
		// Background music suppressed — the grove/bonus ambience (StarpetalBackground)
		// owns the soundtrack, the way the starpetal app handles it. SFX still play.
		soundMusic: () => {},
		soundLoop: ({ name }) => sound.players.loop.play({ name }),
		// Bespoke starpetal reel-stop (turbo-guarded in the sfx module) instead of
		// the template sfx_reel_stop_*; all other one-shots keep the template cue.
		soundOnce: ({ name, forcePlay }) =>
			name.startsWith('sfx_reel_stop')
				? playReelStopSound()
				: sound.players.once.play({ name, forcePlay }),
		soundStop: ({ name }) => sound.stop({ name }),
		soundFade: async ({ name, duration, from, to }) => await sound.fade({ name, duration, from, to }), // prettier-ignore
	});

	onMount(() => {
		preloadStarpetalSfx();
	});
</script>
