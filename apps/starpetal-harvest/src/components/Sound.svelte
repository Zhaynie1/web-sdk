<script lang="ts" module>
	import { type MusicName, type SoundEffectName, type SoundName } from '../game/sound';

	export type EmitterEventSound =
		| { type: 'soundMusic'; name: MusicName }
		| { type: 'soundOnce'; name: SoundEffectName; forcePlay?: boolean }
		| { type: 'soundLoop'; name: SoundEffectName }
		| { type: 'soundStop'; name: SoundName }
		| { type: 'soundFade'; name: SoundName; from: number; to: number; duration: number }
		| { type: 'soundScatterCounterIncrease' }
		| { type: 'soundScatterCounterClear' }
		| { type: 'soundClusterConnect' }
		| { type: 'soundTotalWinNoiseStart' }
		| { type: 'soundTotalWinNoiseStop' }
		| { type: 'soundReelStop' };
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	import { stateBet } from 'state-shared';

	import { getContext } from '../game/context';
	import {
		playClusterConnectSound,
		playReelStopSound,
		playSpinClickSound,
		playTotalWinNoise,
		preloadStarpetalSfx,
		stopTotalWinNoise,
	} from '../game/starpetalSfx';

	const context = getContext();

	context.eventEmitter.subscribeOnMount({
		soundBetMode: async () => {},
		soundPressGeneral: () => {},
		soundPressBet: () => {
			playSpinClickSound();
		},
		soundScatterCounterIncrease: () => (context.stateGame.scatterCounter = context.stateGame.scatterCounter + 1), // prettier-ignore
		soundScatterCounterClear: () => (context.stateGame.scatterCounter = 0),
		soundMusic: () => {},
		soundLoop: () => {},
		soundOnce: () => {},
		soundClusterConnect: () => playClusterConnectSound(),
		soundTotalWinNoiseStart: () => playTotalWinNoise(),
		soundTotalWinNoiseStop: () => stopTotalWinNoise(),
		soundReelStop: () => {
			if (!stateBet.isTurbo) void playReelStopSound();
		},
		soundStop: () => {},
		soundFade: async () => {},
	});

	onMount(() => {
		preloadStarpetalSfx();
	});
</script>