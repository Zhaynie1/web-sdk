export const MIN_BET = 0.2;
export const MAX_BET = 1000;
export const DEFAULT_BET = MIN_BET;

export const BET_AMOUNT_OPTIONS = [
	0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2, 2.5, 3, 4, 5, 7.5, 10, 15, 20, 25, 50, 75, 100,
	125, 150, 200, 250, 300, 400, 500, 750, MAX_BET,
] as const;