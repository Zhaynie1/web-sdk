<script lang="ts">
	import { Container, ParticleEmitter } from 'pixi-svelte';
	import { MainContainer } from 'components-layout';
	import { flower } from 'constants-shared/particleConfig';

	import { getContext } from '../game/context';
	import type { WinLevelAlias } from '../game/winLevelMap';

	// Falling purple flowers (was the coin "rocks"). Reuses the shared `flower`
	// particle config — purple colour gradient + alpha fade — but accelerated
	// downward so petals fall across the board, drawn with the grove-bloom sprite.
	type Props = {
		emit?: boolean;
		levelAlias?: WinLevelAlias;
	};

	const props: Props = $props();
	const context = getContext();

	const board = $derived(context.stateGameDerived.boardLayout());
	const config = $derived({
		...flower,
		scale: { start: 0.34, end: 0.28, minimumScaleMultiplier: 1 },
		speed: { start: 90, end: 50, minimumSpeedMultiplier: 1 },
		acceleration: { x: 0, y: 280 },
		maxSpeed: 0,
		// fall downward (the flower config defaults to drifting up)
		startRotation: { min: 70, max: 110 },
		noRotation: false,
		rotationSpeed: { min: -50, max: 50 },
		lifetime: { min: 2.6, max: 4.2 },
		frequency: 0.09,
		maxParticles: 70,
		spawnType: 'rect' as const,
		spawnRect: {
			x: -board.width * 0.55,
			y: -board.height * 0.6,
			w: board.width * 1.1,
			h: 12,
		},
	});
</script>

<MainContainer>
	<Container x={board.x} y={board.y}>
		<ParticleEmitter {config} key="petalParticle" emit={props.emit} />
	</Container>
</MainContainer>
