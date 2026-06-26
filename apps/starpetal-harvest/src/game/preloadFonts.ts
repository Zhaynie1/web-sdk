/** Ensure Bebas Neue is ready before Pixi draws the home-screen max-win label. */
export const preloadStarpetalFonts = async () => {
	if (typeof document === 'undefined') return;

	try {
		await document.fonts.load('400 64px "Bebas Neue"');
		await document.fonts.ready;
	} catch {
		// Link tag in app.html still provides a fallback load path.
	}
};