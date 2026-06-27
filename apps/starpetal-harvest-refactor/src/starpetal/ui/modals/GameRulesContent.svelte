<script lang="ts">
	import { i18nDerived as i18nUiPixi } from 'components-ui-pixi';

	import { getGameRulesSections } from '$starpetal/config/gameRulesData';

	const gameRulesSections = $derived(getGameRulesSections());
</script>

<div class="game-rules">
	<h2 class="title">{i18nUiPixi.info()}</h2>

	{#each gameRulesSections as section (section.title)}
		<section class="rules-section">
			<h3>{section.title}</h3>
			{#each section.paragraphs as paragraph}
				<p>{paragraph}</p>
			{/each}
		</section>
	{/each}
</div>

<style lang="scss">
	.game-rules {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		width: min(100%, 720px);
		padding: 0.25rem 0.5rem 0.75rem;
		color: #f4f0ff;
	}

	.title {
		margin: 0;
		font-size: 1.35rem;
		font-weight: 700;
		text-align: center;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.rules-section {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding-top: 0.35rem;
		border-top: 1px solid rgba(180, 150, 255, 0.18);

		&:first-of-type {
			border-top: none;
			padding-top: 0;
		}

		h3 {
			margin: 0;
			font-size: 1rem;
			font-weight: 700;
			letter-spacing: 0.04em;
			color: #ffffff;
		}

		p {
			margin: 0;
			font-size: 0.92rem;
			line-height: 1.45;
			color: #efe8ff;
		}
	}
</style>
