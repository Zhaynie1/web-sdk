import type { Bet } from './typesBookEvent';

let baseBooks: Bet[] | null = null;
let bonusBooks: Bet[] | null = null;
let baseLoadPromise: Promise<Bet[]> | null = null;
let bonusLoadPromise: Promise<Bet[]> | null = null;

export const localBooksState = $state({
	baseReady: false,
	bonusReady: false,
	baseLoading: false,
	bonusLoading: false,
	baseError: null as string | null,
});

async function fetchBooks(path: string): Promise<Bet[]> {
	const response = await fetch(path);
	if (!response.ok) {
		throw new Error(`Failed to load ${path} (${response.status})`);
	}
	return response.json() as Promise<Bet[]>;
}

async function importBooks(modulePath: string): Promise<Bet[]> {
	const module = await import(modulePath);
	return module.default as Bet[];
}

async function loadBooks({
	jsonPath,
	modulePath,
}: {
	jsonPath: string;
	modulePath: string;
}): Promise<Bet[]> {
	try {
		return await fetchBooks(jsonPath);
	} catch (jsonError) {
		console.warn(`JSON book load failed for ${jsonPath}, falling back to module`, jsonError);
		return importBooks(modulePath);
	}
}

export function loadBaseBooks(): Promise<Bet[]> {
	if (baseBooks) return Promise.resolve(baseBooks);

	if (!baseLoadPromise) {
		localBooksState.baseLoading = true;
		localBooksState.baseError = null;
		baseLoadPromise = loadBooks({
			jsonPath: '/data/base_books.json',
			modulePath: '../stories/data/base_books',
		})
			.then((books) => {
				baseBooks = books;
				localBooksState.baseReady = true;
				return baseBooks;
			})
			.catch((error) => {
				localBooksState.baseError =
					error instanceof Error ? error.message : 'Failed to load base math books';
				console.error('Base book load failed:', error);
				return [] as Bet[];
			})
			.finally(() => {
				localBooksState.baseLoading = false;
			});
	}

	return baseLoadPromise;
}

export function loadBonusBooks(): Promise<Bet[]> {
	if (bonusBooks) return Promise.resolve(bonusBooks);

	if (!bonusLoadPromise) {
		localBooksState.bonusLoading = true;
		bonusLoadPromise = loadBooks({
			jsonPath: '/data/bonus_books.json',
			modulePath: '../stories/data/bonus_books',
		})
			.then((books) => {
				bonusBooks = books;
				localBooksState.bonusReady = true;
				return bonusBooks;
			})
			.catch((error) => {
				console.error('Bonus book load failed:', error);
				return [] as Bet[];
			})
			.finally(() => {
				localBooksState.bonusLoading = false;
			});
	}

	return bonusLoadPromise;
}

export function getBaseBooks(): Bet[] | null {
	return baseBooks;
}

export function getBonusBooks(): Bet[] | null {
	return bonusBooks;
}