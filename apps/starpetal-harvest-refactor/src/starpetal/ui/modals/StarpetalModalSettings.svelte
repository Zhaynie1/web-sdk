<script lang="ts">
	import { zIndex } from 'constants-shared/zIndex';
	import { Popup } from 'components-shared';
	import { stateModal, stateSound } from 'state-shared';
	import { getContextEventEmitter } from 'utils-event-emitter';

	import BaseTitle from 'components-ui-html/src/components/BaseTitle.svelte';
	import BaseContent from 'components-ui-html/src/components/BaseContent.svelte';
	import type { EmitterEventModal } from 'components-ui-html/src/types';

	// One themed master-volume slider that moves every sound channel together, replacing
	// the engine's three separate sliders (master / music / effects).
	const { eventEmitter } = getContextEventEmitter<EmitterEventModal>();

	const setVolume = (value: number) => {
		stateSound.volumeValueMaster = value;
		stateSound.volumeValueMusic = value;
		stateSound.volumeValueSoundEffect = value;
	};
</script>

{#if stateModal.modal?.name === 'settings'}
	<Popup zIndex={zIndex.modal} onclose={() => (stateModal.modal = null)}>
		<BaseContent maxWidth="100%">
			<BaseTitle>SOUND</BaseTitle>
			<div class="sp-volume">
				<button
					class="sp-mute"
					onclick={() => {
						eventEmitter.broadcast({ type: 'soundPressGeneral' });
						setVolume(stateSound.volumeValueMaster > 0 ? 0 : 80);
					}}
				>
					{stateSound.volumeValueMaster > 0 ? 'ON' : 'OFF'}
				</button>
				<input
					class="sp-range"
					type="range"
					min="0"
					max="100"
					value={stateSound.volumeValueMaster}
					oninput={(event) => setVolume(+event.currentTarget.value)}
				/>
				<div class="sp-value">{stateSound.volumeValueMaster}</div>
			</div>
		</BaseContent>
	</Popup>
{/if}

<style lang="scss">
	.sp-volume {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.85rem 1rem;
		border-radius: 12px;
		background: linear-gradient(180deg, #1b1438 0%, #0a0618 100%);
		border: 1.5px solid rgba(157, 122, 255, 0.5);
		box-shadow:
			0 6px 20px rgba(0, 0, 0, 0.5),
			inset 0 1px 0 rgba(244, 232, 255, 0.1);
		min-width: 300px;

		@media (min-width: 480px) {
			min-width: 380px;
		}
	}

	.sp-mute {
		flex: 0 0 auto;
		min-width: 3.2rem;
		padding: 0.45rem 0.6rem;
		border-radius: 8px;
		cursor: pointer;
		color: #f4e8ff;
		font-weight: 800;
		font-family: 'proxima-nova', sans-serif;
		background: linear-gradient(180deg, #4a2f7d 0%, #2a1c47 100%);
		border: 1.5px solid rgba(157, 122, 255, 0.55);
		box-shadow: inset 0 1px 0 rgba(244, 232, 255, 0.3);
	}

	.sp-value {
		flex: 0 0 auto;
		min-width: 2.5rem;
		text-align: center;
		color: #f4e8ff;
		font-weight: 700;
		font-family: 'proxima-nova', sans-serif;
	}

	.sp-range {
		-webkit-appearance: none;
		appearance: none;
		flex: 1 1 auto;
		height: 8px;
		border-radius: 6px;
		background: linear-gradient(90deg, #7b5cff 0%, #9d7aff 100%);
		outline: none;
		cursor: pointer;
	}

	.sp-range::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 30%, #ffffff, #c8b8e8 55%, #7b5cff);
		border: 2px solid #f4e8ff;
		box-shadow: 0 0 8px rgba(157, 122, 255, 0.85);
		cursor: pointer;
	}

	.sp-range::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 30%, #ffffff, #c8b8e8 55%, #7b5cff);
		border: 2px solid #f4e8ff;
		box-shadow: 0 0 8px rgba(157, 122, 255, 0.85);
		cursor: pointer;
	}
</style>
