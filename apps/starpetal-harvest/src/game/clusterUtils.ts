import type { Position } from './types';

const ORTHOGONAL_DELTAS = [
	[0, 1],
	[0, -1],
	[1, 0],
	[-1, 0],
] as const;

const positionKey = (position: Position) => `${position.reel},${position.row}`;

export const getConnectedComponents = (positions: Position[]): Position[][] => {
	if (positions.length === 0) return [];

	const posSet = new Set(positions.map(positionKey));
	const visited = new Set<string>();
	const components: Position[][] = [];

	for (const position of positions) {
		const key = positionKey(position);
		if (visited.has(key)) continue;

		const component: Position[] = [];
		const queue: Position[] = [position];
		visited.add(key);

		while (queue.length > 0) {
			const current = queue.shift()!;
			component.push(current);

			for (const [deltaReel, deltaRow] of ORTHOGONAL_DELTAS) {
				const neighbor = { reel: current.reel + deltaReel, row: current.row + deltaRow };
				const neighborKey = positionKey(neighbor);
				if (posSet.has(neighborKey) && !visited.has(neighborKey)) {
					visited.add(neighborKey);
					queue.push(neighbor);
				}
			}
		}

		components.push(component);
	}

	return components;
};

export const getValidClusters = (positions: Position[], minSize = 5): Position[][] =>
	getConnectedComponents(positions).filter((component) => component.length >= minSize);

export const getClusterEdges = (positions: Position[]): [Position, Position][] => {
	const posSet = new Set(positions.map(positionKey));
	const edges: [Position, Position][] = [];
	const seen = new Set<string>();

	for (const position of positions) {
		for (const [deltaReel, deltaRow] of ORTHOGONAL_DELTAS) {
			const neighbor = { reel: position.reel + deltaReel, row: position.row + deltaRow };
			const neighborKey = positionKey(neighbor);
			if (!posSet.has(neighborKey)) continue;

			const edgeKey = [positionKey(position), neighborKey].sort().join('|');
			if (seen.has(edgeKey)) continue;
			seen.add(edgeKey);
			edges.push([position, neighbor]);
		}
	}

	return edges;
};

export const getClusterCenter = (positions: Position[]): Position => ({
	reel: Math.round(positions.reduce((sum, position) => sum + position.reel, 0) / positions.length),
	row: Math.round(positions.reduce((sum, position) => sum + position.row, 0) / positions.length),
});