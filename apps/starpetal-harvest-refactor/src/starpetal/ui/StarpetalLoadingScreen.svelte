<script lang="ts">
	import { Container, Graphics, Sprite, Text } from 'pixi-svelte';
	import { FadeContainer, LoadingProgress } from 'components-pixi';
	import { MainContainer, OnPressFullScreen } from 'components-layout';
	import { OnHotkey } from 'components-shared';

	import { getContext } from '$game/context';
	import { THEME } from '$starpetal/config/theme';

	// Starpetal loading screen: forest logo + theme-coloured progress bar, over the
	// grove video that already plays behind the transparent canvas. Replaces the
	// engine's "Mining Mayhem" Spine loader. Press dismisses straight to the game.
	type Props = { onloaded: () => void };
	const props: Props = $props();

	const context = getContext();
	const layout = $derived(context.stateLayoutDerived.mainLayout());

	// logo art is ~1.94:1
	const LOGO_W = 420;
	const LOGO_H = LOGO_W / 1.943;
</script>

<FadeContainer show duration={120}>
	<MainContainer>
		<Container x={layout.width * 0.5} y={layout.height * 0.5}>
			<Sprite key="starpetalLogo" width={LOGO_W} height={LOGO_H} anchor={0.5} y={-30} />

			{#if !context.stateApp.loaded}
				<LoadingProgress y={LOGO_H * 0.5 + 24} width={300} height={16}>
					{#snippet background(sizes)}
						<Graphics
							{...sizes}
							draw={(g) => {
								g.clear();
								g.roundRect(0, 0, sizes.width, sizes.height, 8);
								g.fill({ color: THEME.frame, alpha: 0.85 });
							}}
						/>
					{/snippet}
					{#snippet progress(sizes)}
						<Graphics
							{...sizes}
							draw={(g) => {
								g.clear();
								g.roundRect(0, 0, sizes.width, sizes.height, 8);
								g.fill({ color: THEME.aurora, alpha: 0.95 });
							}}
						/>
					{/snippet}
					{#snippet frame(sizes)}
						<Graphics
							{...sizes}
							draw={(g) => {
								g.clear();
								g.roundRect(0, 0, sizes.width, sizes.height, 8);
								g.stroke({ color: THEME.frameGlow, width: 2, alpha: 0.7 });
							}}
						/>
					{/snippet}
				</LoadingProgress>
			{/if}
		</Container>
	</MainContainer>
</FadeContainer>

{#if context.stateApp.loaded}
	<MainContainer alignVertical="bottom">
		<Text
			text="PRESS ANYWHERE TO CONTINUE"
			anchor={{ x: 0.5, y: 1 }}
			x={layout.width * 0.5}
			y={layout.height - 48}
			style={{
				fill: THEME.starlight,
				fontSize: 26,
				fontFamily: 'proxima-nova, sans-serif',
				fontWeight: '600',
				letterSpacing: 2,
			}}
		/>
	</MainContainer>
	<OnHotkey hotkey="Space" onpress={() => props.onloaded()} />
	<OnPressFullScreen onpress={() => props.onloaded()} />
{/if}
