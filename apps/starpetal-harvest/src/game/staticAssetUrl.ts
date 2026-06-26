/** Resolve paths under `static/` for Stake deploys (`base: './'`). */
export const staticAssetUrl = (relativePath: string): string => {
	const normalized = relativePath.replace(/^\//, '');
	const base = import.meta.env.BASE_URL ?? '/';

	if (typeof window === 'undefined') {
		return `${base}${normalized}`;
	}

	return new URL(`${base}${normalized}`, window.location.href).href;
};