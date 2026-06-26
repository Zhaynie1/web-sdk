export const isLocalPlayRoute = () =>
	typeof window !== 'undefined' && window.location.pathname.startsWith('/play');