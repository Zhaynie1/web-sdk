<script lang="ts">
	import { stateBet } from 'state-shared';
	import { numberToCurrencyString } from 'utils-shared/amount';
	import { i18nDerived as i18nUiPixi } from 'components-ui-pixi';

	import {
		getPaytableIntro,
		getPaytableScatter,
		PAYTABLE_PAYING_SYMBOLS,
		type PayTier,
	} from '$starpetal/config/payTableData';

	const paytableIntro = $derived(getPaytableIntro());
	const paytableScatter = $derived(getPaytableScatter());

	const formatPay = (tier: PayTier) => numberToCurrencyString(tier.multiplier * stateBet.betAmount);
</script>

<div class="paytable">
	<h2 class="title">{i18nUiPixi.payTable()}</h2>
	<p class="intro">{paytableIntro}</p>

	<div class="symbol-grid">
		{#each PAYTABLE_PAYING_SYMBOLS as symbol (symbol.id)}
			<section class="symbol-column">
				<div class="symbol-art">
					<img src={symbol.image} alt="" />
				</div>

				<div class="symbol-pays">
					{#each symbol.tiers as tier (tier.label)}
						<span class="cluster">{tier.label}</span>
						<span class="amount">{formatPay(tier)}</span>
					{/each}
				</div>
			</section>
		{/each}
	</div>

	<section class="scatter-row">
		<div class="scatter-art">
			<img src={paytableScatter.image} alt="" />
		</div>
		<div class="scatter-copy">
			{#each paytableScatter.lines as line}
				<p>{line}</p>
			{/each}
		</div>
	</section>
</div>

<style lang="scss">
	.paytable {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: min(100%, 960px);
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

	.intro {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.45;
		text-align: center;
		color: #efe8ff;
	}

	.symbol-grid {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 0.65rem;
		align-items: start;
	}

	.symbol-column {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.45rem;
		min-width: 0;
	}

	.symbol-art {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;

		img {
			width: min(100%, 78px);
			height: 78px;
			object-fit: contain;
		}
	}

	.symbol-pays {
		display: grid;
		grid-template-columns: auto auto;
		column-gap: 0.5rem;
		row-gap: 0.12rem;
		width: fit-content; /* shrink to content so it centers under the symbol */
		font-size: 0.78rem;
		font-weight: 600;
		line-height: 1.2;
	}

	.cluster {
		color: #efe8ff;
		white-space: nowrap;
		text-align: left;
	}

	.amount {
		color: #ffffff;
		white-space: nowrap;
		text-align: right;
	}

	.scatter-row {
		display: grid;
		grid-template-columns: 140px 1fr;
		align-items: center;
		gap: 1rem;
		margin-top: 0.35rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(180, 150, 255, 0.2);
	}

	.scatter-art {
		display: flex;
		align-items: center;
		justify-content: center;

		img {
			width: 120px;
			height: 120px;
			object-fit: contain;
		}
	}

	.scatter-copy {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;

		p {
			margin: 0;
			font-size: 0.95rem;
			line-height: 1.4;
			color: #efe8ff;
		}
	}

	@media (max-width: 900px) {
		.symbol-grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	@media (max-width: 560px) {
		.symbol-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.scatter-row {
			grid-template-columns: 1fr;
			justify-items: center;
			text-align: center;
		}
	}
</style>
