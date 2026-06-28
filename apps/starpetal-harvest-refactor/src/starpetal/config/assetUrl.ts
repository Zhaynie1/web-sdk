import { base } from '$app/paths';

/**
 * Resolve a static asset path (served from /static) against SvelteKit's `base`.
 *
 * Absolute paths ("/starpetal/…") break on Stake's sub-path mount; bare-relative
 * ("starpetal/…") break on the /play route (they resolve against the route, e.g.
 * "/play/starpetal/…"). `base` is route-aware (paths.relative), so this resolves
 * correctly on "/", on "/play", and under Stake's "front/" prefix.
 */
export const assetUrl = (path: string) => `${base}/${path.replace(/^\/+/, '')}`;
