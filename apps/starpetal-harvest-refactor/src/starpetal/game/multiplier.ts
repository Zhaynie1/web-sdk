/** Coerce a book multiplier (number | "4" | undefined) to a finite number. */
export const normalizeMultiplier = (
	value: number | string | undefined,
): number | undefined => {
	if (value === undefined) return undefined;
	const num = typeof value === 'string' ? Number.parseInt(value, 10) : value;
	return Number.isFinite(num) ? num : undefined;
};
