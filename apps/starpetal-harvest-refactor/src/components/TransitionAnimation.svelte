<script lang="ts">
	import { onMount } from 'svelte';
	import { Tween } from 'svelte/motion';
	import { Container, ParticleEmitter } from 'pixi-svelte';
	import { CanvasSizeRectangle } from 'components-layout';
	import { flower } from 'constants-shared/particleConfig';
	import { stateBetDerived } from 'state-shared';
	import { waitForTimeout } from 'utils-shared/wait';

	import { getContext } from '../game/context';
	import { THEME } from '$starpetal/config/theme';

	// Bonus transition — a full-screen fall of purple flowers (the same petals as the
	// win screens) over a brief scrim, replacing the cluster-example rock-debris
	// transition spine.
	type Props = {
		oncomplete: () => void;
	};

	const props: Props = $props();
	const context = getContext();
	const canvas = $derived(context.stateLayoutDerived.canvasSizes());

	const scrim = new Tween(0);
	let emit = $state(true);

	const config = $derived({
		...flower,
		scale: { start: 0.42, end: 0.34, minimumScaleMultiplier: 1 },
		speed: { start: 130, end: 70, minimumSpeedMultiplier: 1 },
		acceleration: { x: 0, y: 340 },
		maxSpeed: 0,
		startRotation: { min: 70, max: 110 },
		noRotation: false,
		rotationSpeed: { min: -60, max: 60 },
		lifetime: { min: 2, max: 3.6 },
		frequency: 0.035,
		maxParticles: 140,
		spawnType: 'rect' as const,
		spawnRect: { x: -canvas.width * 0.55, y: -60, w: canvas.width * 1.1, h: 14 },
	});

	onMount(async () => {
		const ts = stateBetDerived.timeScale() || 1;
		await scrim.set(0.6, { duration: 220 / ts });
		await waitForTimeout(800 / ts);
		emit = false; // stop spawning; let the last petals fall
		await scrim.set(0, { duration: 260 / ts });
		await waitForTimeout(220 / ts);
		props.oncomplete();
	});
</script>

<CanvasSizeRectangle eventMode="none" backgroundColor={THEME.bgDeep} backgroundAlpha={scrim.current} />
<Container x={canvas.width * 0.5} y={0}>
	<ParticleEmitter key="petalParticle" {config} {emit} />
</Container>
