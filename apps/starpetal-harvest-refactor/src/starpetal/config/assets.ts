/**
 * Starpetal art overrides, merged into the engine asset manifest (game/assets.ts).
 *
 * Board symbols are sprite-only PNGs served from `static/starpetal/` (SvelteKit
 * serves `static/` at the site root, so no Vite fs-allow/transform concerns —
 * same approach the local books use). Keys here (sp_*) are referenced by
 * config/symbols.ts.
 */
export const starpetalAssets = {
	sp_h1: { type: 'sprite', src: '/starpetal/symbols/h1_starpetal.png' },
	sp_h2: { type: 'sprite', src: '/starpetal/symbols/h2_cosmic_wasp.png' },
	sp_h3: { type: 'sprite', src: '/starpetal/symbols/h3_lunar_fox.png' },
	sp_h4: { type: 'sprite', src: '/starpetal/symbols/h4_aurora_butterfly.png' },
	sp_l1: { type: 'sprite', src: '/starpetal/symbols/l1_dewdrop.png' },
	sp_l2: { type: 'sprite', src: '/starpetal/symbols/l2_starfall_leaf.png' },
	sp_l3: { type: 'sprite', src: '/starpetal/symbols/l3_grove_bloom.png' },
	sp_s: { type: 'sprite', src: '/starpetal/symbols/s_falling_star.png' },
	sp_w: { type: 'sprite', src: '/starpetal/symbols/w_glowing_vine_wild.png' },
	sp_m2: { type: 'sprite', src: '/starpetal/symbols/m_2x.png' },
	sp_m4: { type: 'sprite', src: '/starpetal/symbols/m_4x.png' },
	sp_m8: { type: 'sprite', src: '/starpetal/symbols/m_8x.png' },
	sp_m16: { type: 'sprite', src: '/starpetal/symbols/m_16x.png' },
	sp_m32: { type: 'sprite', src: '/starpetal/symbols/m_32x.png' },
	sp_m64: { type: 'sprite', src: '/starpetal/symbols/m_64x.png' },
	sp_m128: { type: 'sprite', src: '/starpetal/symbols/m_128x.png' },
	sp_m256: { type: 'sprite', src: '/starpetal/symbols/m_256x.png' },
	sp_m512: { type: 'sprite', src: '/starpetal/symbols/m_512x.png' },
	starpetalWinFrame: { type: 'sprite', src: '/starpetal/ui/starpetal_win_frame.png' },
	starpetalBg: { type: 'sprite', src: '/starpetal/backgrounds/twilight_grove.jpg' },
	// preload so the loading screen can show the logo before the main bundle lands.
	starpetalLogo: { type: 'sprite', src: '/starpetal/ui/starpetal_forest_logo.png', preload: true },
} as const;
