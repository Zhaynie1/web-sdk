<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { Container, Graphics, Rectangle, Text } from 'pixi-svelte';
	import { BLACK } from 'constants-shared/colors';
	import { stateUi, stateModal } from 'state-shared';

	import { getContext } from '$game/context';
	import { THEME } from '$starpetal/config/theme';
	import IconButton from './IconButton.svelte';

	// Menu overlay opened by the bottom-bar menu button (stateUi.menuOpen). The
	// original exposed Paytable / Game Rules / Settings here behind a dim scrim;
	// this restores that entry point — Game Rules and Settings have no other way in.
	const context = getContext();
	const canvas = $derived(context.stateLayoutDerived.canvasSizes());
	const main = $derived(context.stateLayoutDerived.mainLayoutStandard());
	const W = $derived(main.width);
	const H = $derived(main.height);

	const close = () => (stateUi.menuOpen = false);
	const open = (modal: { name: string }) => {
		stateModal.modal = modal;
		close();
	};

	const items = [
		{ icon: 'paytable', label: 'PAYTABLE', onpress: () => open({ name: 'payTable' }) },
		{ icon: 'info', label: 'GAME RULES', onpress: () => open({ name: 'gameRules' }) },
	] as const;

	const PANEL_W = 520;
	const PANEL_H = 260;
	const COL = 150;
	const startX = -((items.length - 1) * COL) / 2;
</script>

{#if stateUi.menuOpen}
	<!-- dim scrim across the whole canvas; tap anywhere to close -->
	<Rectangle
		eventMode="static"
		cursor="pointer"
		alpha={0.6}
		anchor={0.5}
		backgroundColor={BLACK}
		width={canvas.width}
		height={canvas.height}
		x={canvas.width * 0.5}
		y={canvas.height * 0.5}
		onpointerup={close}
	/>

	<MainContainer standard>
		<Container x={W / 2} y={H / 2}>
			<Graphics
				draw={(g) => {
					g.clear();
					g.roundRect(-PANEL_W / 2, -PANEL_H / 2, PANEL_W, PANEL_H, 22);
					g.fill({ color: THEME.bgMid, alpha: 0.97 });
					g.roundRect(-PANEL_W / 2, -PANEL_H / 2, PANEL_W, PANEL_H, 22);
					g.stroke({ color: THEME.vine, width: 2, alpha: 0.5 });
				}}
			/>

			<Text
				anchor={{ x: 0.5, y: 0.5 }}
				y={-PANEL_H / 2 + 34}
				text="MENU"
				style={{
					fontFamily: 'proxima-nova, Impact, sans-serif',
					fontWeight: '900',
					fontSize: 30,
					fill: THEME.gold,
					stroke: { color: THEME.bgDeep, width: 4 },
				}}
			/>

			<IconButton icon="exit" x={PANEL_W / 2 - 34} y={-PANEL_H / 2 + 34} size={56} onpress={close} />

			{#each items as item, i}
				<Container x={startX + i * COL} y={18}>
					<IconButton icon={item.icon} size={104} onpress={item.onpress} />
					<Text
						anchor={{ x: 0.5, y: 0.5 }}
						y={78}
						text={item.label}
						style={{
							align: 'center',
							fontFamily: 'proxima-nova, Impact, sans-serif',
							fontWeight: '700',
							fontSize: 18,
							fill: THEME.starlight,
							stroke: { color: THEME.bgDeep, width: 3 },
						}}
					/>
				</Container>
			{/each}
		</Container>
	</MainContainer>
{/if}
