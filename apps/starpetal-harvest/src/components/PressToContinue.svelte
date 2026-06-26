<script lang="ts">
	import { MainContainer, OnPressFullScreen } from 'components-layout';
	import { OnHotkey } from 'components-shared';
	import { Text, REM } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import { THEME } from '../game/theme';

	type Props = {
		onpress: () => void;
		disabled?: boolean;
	};

	const props: Props = $props();
	const context = getContext();
</script>

<MainContainer alignVertical="bottom">
	<Text
		anchor={{ x: 0.5, y: 1 }}
		x={context.stateLayoutDerived.mainLayout().width * 0.5}
		y={context.stateLayoutDerived.mainLayout().height - 24}
		text="Press anywhere to enter the grove"
		style={{
			fontFamily: 'proxima-nova, Georgia, serif',
			fontSize: REM * 1.2,
			fontWeight: '500',
			fill: THEME.mist,
			letterSpacing: 1,
		}}
	/>
</MainContainer>
<OnHotkey
	hotkey="Space"
	disabled={props.disabled}
	onpress={() => {
		if (props.disabled) return;
		props.onpress();
	}}
/>
{#if !props.disabled}
	<OnPressFullScreen onpress={() => props.onpress()} />
{/if}