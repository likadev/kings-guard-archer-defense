// javascript-astar 0.4.0
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a Binary Heap.
// Includes Binary Heap (with modifications) from Marijn Haverbeke.
// http://eloquentjavascript.net/appendix2.html

// TypeScript definition file created by likadev.

declare class GridNode {
    x: number;
    y: number;
    weight: number;

    constructor(x: number, y: number, weight: number);

    toString(): string;

    getCost(): number;

    isWall(): boolean;
}

interface GraphOptions {
    diagonal?: boolean;
}

declare class Graph {
    nodes: GridNode[];
    diagonal: boolean;
    grid: Array<GridNode[]>;
    dirtyNodes: GridNode[];

    constructor(gridIn: number[], options?: GraphOptions);

    init(): void;

    cleanDirty(): void;

    markDirty(node: GridNode); void;

    neighbors(node: GridNode): GridNode[];

    toString(): string;
}

interface AStarSearchOptions {
    closest?: boolean;
    heuristic?: any;
}

declare class astar {
    static heuristics: {
        manhattan: (pos0, pos1) => number;

        diagonal: (pos0, pos1) => number;
    };

    static search: (graph: Graph, start: GridNode, end: GridNode, options?: AStarSearchOptions) => GridNode[];

    static cleanNode(node: GridNode);
}