export default {
	pressToContinueText: {
		type: 'sprites',
		src: new URL('../../assets/sprites/pressToContinueText/MM_pressanywhere.json', import.meta.url).href,
	},
	starpetalForestLogo: {
		type: 'sprite',
		src: new URL('../../assets/sprites/ui/starpetal_forest_logo.png', import.meta.url).href,
		preload: true,
	},


	M: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols2/symbols2.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols2/M.json', import.meta.url).href,
			scale: 2,
		},
	},

	explosion: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols3/symbols3.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols3/explosion.json', import.meta.url).href,
			scale: 2,
		},
	},
	W: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols3/symbols3.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols3/W.json', import.meta.url).href,
			scale: 2,
		},
	},
	payFrame: {
		type: 'sprite',
		src: new URL('../../assets/sprites/payFrame/payFrame.png', import.meta.url).href,
	},
	starpetalH1: {
		type: 'sprite',
		src: new URL('../../assets/sprites/starpetal/h1_starpetal.png', import.meta.url).href,
	},
	starpetalH2: {
		type: 'sprite',
		src: new URL('../../assets/sprites/starpetal/h2_cosmic_wasp.png', import.meta.url).href,
	},
	starpetalH3: {
		type: 'sprite',
		src: new URL('../../assets/sprites/starpetal/h3_lunar_fox.png', import.meta.url).href,
	},
	starpetalH4: {
		type: 'sprite',
		src: new URL('../../assets/sprites/starpetal/h4_aurora_butterfly.png', import.meta.url).href,
	},
	starpetalL1: {
		type: 'sprite',
		src: new URL('../../assets/sprites/starpetal/l1_dewdrop.png', import.meta.url).href,
	},
	starpetalL2: {
		type: 'sprite',
		src: new URL('../../assets/sprites/starpetal/l2_starfall_leaf.png', import.meta.url).href,
	},
	starpetalL3: {
		type: 'sprite',
		src: new URL('../../assets/sprites/starpetal/l3_grove_bloom.png', import.meta.url).href,
	},
	starpetalS: {
		type: 'sprite',
		src: new URL('../../assets/sprites/starpetal/s_falling_star.png', import.meta.url).href,
	},
	starpetalW: {
		type: 'sprite',
		src: new URL('../../assets/sprites/starpetal/w_glowing_vine_wild.png', import.meta.url).href,
	},
	starpetalM2: {
		type: 'sprite',
		src: new URL('../../assets/sprites/starpetal/m_2x.png', import.meta.url).href,
	},
	starpetalM4: {
		type: 'sprite',
		src: new URL('../../assets/sprites/starpetal/m_4x.png', import.meta.url).href,
	},
	starpetalM8: {
		type: 'sprite',
		src: new URL('../../assets/sprites/starpetal/m_8x.png', import.meta.url).href,
	},
	starpetalM16: {
		type: 'sprite',
		src: new URL('../../assets/sprites/starpetal/m_16x.png', import.meta.url).href,
	},
	starpetalM32: {
		type: 'sprite',
		src: new URL('../../assets/sprites/starpetal/m_32x.png', import.meta.url).href,
	},
	starpetalM64: {
		type: 'sprite',
		src: new URL('../../assets/sprites/starpetal/m_64x.png', import.meta.url).href,
	},
	starpetalM128: {
		type: 'sprite',
		src: new URL('../../assets/sprites/starpetal/m_128x.png', import.meta.url).href,
	},
	starpetalM256: {
		type: 'sprite',
		src: new URL('../../assets/sprites/starpetal/m_256x.png', import.meta.url).href,
	},
	starpetalM512: {
		type: 'sprite',
		src: new URL('../../assets/sprites/starpetal/m_512x.png', import.meta.url).href,
	},
	starpetalM250: {
		type: 'sprite',
		src: new URL('../../assets/sprites/starpetal/m_250x.png', import.meta.url).href,
	},
	anticipation: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/anticipation/anticipation.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/anticipation/anticipation.json', import.meta.url).href,
			scale: 1.35,
		},
	},
	goldFont: {
		type: 'font',
		src: new URL('../../assets/fonts/goldFont/mm_gold.xml', import.meta.url).href,
	},
	goldBlur: {
		type: 'font',
		src: new URL('../../assets/fonts/goldBlur/miningfont_gold_blur.xml', import.meta.url).href,
	},
	silverFont: {
		type: 'font',
		src: new URL('../../assets/fonts/silverFont/mm_silver.xml', import.meta.url).href,
	},
	purpleFont: {
		type: 'font',
		src: new URL('../../assets/fonts/purpleFont/mm_purple.xml', import.meta.url).href,
	},

	fsIntro: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/fsIntro/fs_screen.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/fsIntro/fs_screen.json', import.meta.url).href,
			scale: 2,
		},
	},
	fsIntroNumber: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/fsIntro/fs_screen.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/fsIntro/fs_screen_number.json', import.meta.url).href,
			scale: 2,
		},
	},
	fsOutroNumber: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/fsIntro/fs_screen.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/fsIntro/fs_total_number.json', import.meta.url).href,
			scale: 2,
		},
	},
	tumble_multiplier: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/tumbleWin/tumble_win.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/tumbleWin/tumble_multiplier.json', import.meta.url).href,
			scale: 2,
		},
	},
	reelhouse: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/reelhouse/reelhouse_glow.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/reelhouse/reelhouse_glow.json', import.meta.url).href,
			scale: 2,
		},
	},
	progressBar: {
		type: 'sprites',
		src: new URL('../../assets/sprites/progressBar/progressBar.json', import.meta.url).href,
	},
	freeSpins: {
		type: 'sprites',
		src: new URL('../../assets/sprites/freeSpins/freeSpins.json', import.meta.url).href,
	},

	clusterWin: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/clusterWin/clusterpay.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/clusterWin/clusterpay.json', import.meta.url).href,
			scale: 2,
		},
	},
	transition: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/transition/transition.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/transition/transition.json', import.meta.url).href,
			scale: 2,
		},
	},
	coins: {
		type: 'spriteSheet',
		src: new URL('../../assets/sprites/coin/SD2_Coin.json', import.meta.url).href,
	},
} as const;
