<script lang="ts">
	import { Container, Graphics } from 'pixi-svelte';
	import { FadeContainer, LoadingProgress } from 'components-pixi';
	import { MainContainer } from 'components-layout';

	import { getContext } from '../game/context';
	import { getMaxWinLabelLayout } from '../game/logoConstants';
	import { THEME } from '../game/theme';
	import GameTitleLogo from './ui/GameTitleLogo.svelte';
	import PressToContinue from './PressToContinue.svelte';

	type Props = {
		onloaded: () => void;
	};

	const props: Props = $props();
	const context = getContext();

	const layout = $derived(context.stateLayoutDerived.mainLayout());

	const logoScale = 0.88;
	const logoLayout = $derived(getMaxWinLabelLayout(logoScale));
	const logoY = $derived(-logoLayout.totalHeight * 0.5);
	const progressY = $derived(logoLayout.totalHeight * 0.5 + 28);
</script>

<FadeContainer show duration={120}>
	<MainContainer>
		<Container x={layout.width * 0.5} y={layout.height * 0.5}>
			<GameTitleLogo x={0} y={logoY} scale={logoScale} />

			{#if !context.stateApp.loaded}
				<LoadingProgress y={progressY} width={280} height={16}>
					{#snippet background(sizes)}
						<Graphics
							{...sizes}
							draw={(g) => {
								g.clear();
								g.roundRect(0, 0, sizes.width, sizes.height, 8);
								g.fill({ color: THEME.frame, alpha: 0.8 });
							}}
						/>
					{/snippet}
					{#snippet progress(sizes)}
						<Graphics
							{...sizes}
							draw={(g) => {
								g.clear();
								g.roundRect(0, 0, sizes.width, sizes.height, 8);
								g.fill({ color: THEME.aurora, alpha: 0.9 });
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
	<PressToContinue onpress={props.onloaded} />
{/if}