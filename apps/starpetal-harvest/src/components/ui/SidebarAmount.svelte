<script lang="ts">
	import { Text } from 'pixi-svelte';

	import { UI_BASE_FONT_SIZE } from 'components-ui-pixi/src/constants';

	type Props = {
		label: string;
		value: string;
	};

	const props: Props = $props();

	const labelStyle = {
		fontFamily: 'proxima-nova',
		fontSize: UI_BASE_FONT_SIZE * 0.82,
		fill: 0xc8b8e8,
	} as const;

	const valueStyle = {
		fontFamily: 'proxima-nova',
		fontSize: UI_BASE_FONT_SIZE * 1.05,
		fill: 0xf4e8ff,
		fontWeight: '600' as const,
	};
</script>

<Text anchor={{ x: 0, y: 0 }} text={props.label} style={labelStyle} />
<Text anchor={{ x: 0, y: 0 }} text={props.value} style={valueStyle} y={UI_BASE_FONT_SIZE * 0.95} />