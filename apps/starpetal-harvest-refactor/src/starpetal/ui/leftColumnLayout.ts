/**
 * Shared geometry for the starpetal left column (standard 1920×1080 space,
 * left-aligned to the canvas edge). Single source of truth so the title logo,
 * the free-spin counter slot, and the feature window stack without overlapping.
 *
 * Stack, top → bottom:  logo → free-spin counter (free game only) → feature window.
 *
 * The counter only shows during free spins, so the window sits directly under the
 * logo in the base game and shifts down by the reserved counter slot in free game.
 */
const centerX = 250;

const logoY = 20;
const logoW = 420;
const logoH = logoW / 1.943;
const gapBelowLogo = 36;

const fsCounterW = 340;
const fsCounterH = 130;
const fsSlotGap = 24;

const winW = 380;
const winH = 320;

/** Top of the area below the logo (where the counter sits / the window starts in base). */
const slotTop = logoY + logoH + gapBelowLogo;
/** Vertical room the counter occupies in free game (window shifts down by this). */
const fsSlot = fsCounterH + fsSlotGap;

export const LEFT_COLUMN = {
	centerX,
	logoY,
	logoW,
	logoH,
	fsCounterW,
	fsCounterH,
	/** Centre Y of the free-spin counter, in its reserved slot below the logo. */
	fsCounterCenterY: slotTop + fsCounterH / 2,
	winW,
	winH,
	/** Window top: directly under the logo in base game; below the counter slot in free game. */
	winTop: (isFreeGame: boolean) => slotTop + (isFreeGame ? fsSlot : 0),
};
