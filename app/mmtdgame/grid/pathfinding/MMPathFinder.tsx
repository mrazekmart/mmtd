import {MMGridType} from "../MMGridMesh";
import {Vector3} from "three";
import {CELL_HEIGHT, CELL_WIDTH, GRID_SIZE_HEIGHT, GRID_SIZE_WIDTH} from "../../MMTDGameInitializer";
import {MMGridCell} from "../MMGridCell";
import {gridPositionFromVector} from "../../util/MMMathUtil";

/**
 * The MMPathFinder class provides functionalities to find the shortest path
 * between two nodes within a given grid using the A* pathfinding algorithm.
 *
 * The class can be initialized directly with a 2D array of MMNode objects,
 * or it can convert an MMGridManager instance into the required format for pathfinding.
 *
 * Key Features:
 * 1. Uses the Manhattan distance heuristic for efficient path estimation.
 * 2. Allows for easy conversion of an MMGridManager instance into pathfinding nodes.
 * 3. Offers a method to retrieve the shortest path between the start and end nodes.
 *
 * Example usage:
 * const pathFinder = MMPathFinder.ofGrid(myGridInstance);
 * const path = pathFinder.findPath();
 *
 * Note: It's important to ensure the MMGridManager instance contains both start and end nodes.
 */
export class MMPathFinder {

    private static instance: MMPathFinder;

    grid!: MMNode[][];
    startNode!: MMNode;
    endNode!: MMNode;

    private constructor() {
    }

    /**
     * Singleton method to get the instance of the MMPathFinder.
     *
     * If an instance doesn't already exist, it creates a new one.
     * Otherwise, it returns the existing instance.
     *
     * @returns The single instance of MMPathFinder.
     */
    public static getInstance(): MMPathFinder {
        if (!this.instance) {

            this.instance = new MMPathFinder();
        }
        return this.instance;
    }

    /**
     * Converts a given MMGridManager to a 2D array of MMNode objects.
     *
     * @returns An instance of MMPathFinder initialized with the created node grid.
     * @param grid
     */
    static ofGrid(grid: MMGridCell[][]): MMPathFinder {
        const nodeGrid: MMNode[][] = [];
        let startNode: MMNode = {} as any;
        let endNode: MMNode = {} as any;

        grid.forEach(row => {
            let currentRow: MMNode[] = [];
            row.forEach(cell => {
                const node: MMNode =
                    {
                        x: cell.gridPosition.x,
                        y: cell.gridPosition.y,
                        walkable: cell.gridMesh.walkable,
                        npcWalkable: cell.gridMesh.npcWalkable,
                        center: new Vector3(
                            cell.gridPosition.x * CELL_WIDTH - (GRID_SIZE_WIDTH * CELL_WIDTH) / 2 + CELL_WIDTH / 2,
                            -cell.gridPosition.y * CELL_HEIGHT + (GRID_SIZE_HEIGHT * CELL_HEIGHT) / 2 - CELL_HEIGHT / 2,
                            0),
                        type: cell.gridMesh.gridType,
                    };

                if (cell.gridMesh.gridType === MMGridType.Start) startNode = node;
                if (cell.gridMesh.gridType === MMGridType.End) endNode = node;
                currentRow.push(node);
            });
            nodeGrid.push(currentRow);
        });
        this.getInstance().grid = nodeGrid;
        this.getInstance().startNode = startNode;
        this.getInstance().endNode = endNode;
        return this.getInstance();
    }

    /**
     * Searches for the shortest path between the provided start and target nodes, or
     * defaults to the initialized start and end nodes if not provided.
     *
     * @param start - The optional starting point for pathfinding. Defaults to the class's initialized start node.
     * @param target - The optional destination point for pathfinding. Defaults to the class's initialized end node.
     * @returns An array of nodes forming the path, or null if no path is found.
     */
    findPath(start?: MMNode, target?: MMNode): MMNode[] | null {
        const openList: MMNode[] = [];
        const closedList: Set<MMNode> = new Set();

        if (!start) start = this.startNode;
        if (!target) target = this.endNode;

        const gValues: Map<MMNode, number> = new Map();
        const fValues: Map<MMNode, number> = new Map();
        const hValues: Map<MMNode, number> = new Map();
        const parents: Map<MMNode, MMNode> = new Map();

        gValues.set(start, 0);
        hValues.set(start, this.heuristic(start, target));
        fValues.set(start, gValues.get(start)! + hValues.get(start)!);

        openList.push(start);

        while (openList.length > 0) {
            openList.sort((a, b) => fValues.get(a)! - fValues.get(b)!);
            const currentNode = openList.shift()!;

            if (currentNode === target) {
                return this.constructPathWithParents(currentNode, parents);
            }

            closedList.add(currentNode);

            const neighbors = this.getNeighbors(currentNode);
            for (const neighbor of neighbors) {
                if (!neighbor.walkable || closedList.has(neighbor)) {
                    continue;
                }

                const tentative_g = gValues.get(currentNode)! + 1;
                if (!openList.includes(neighbor) || tentative_g < gValues.get(neighbor)!) {
                    parents.set(neighbor, currentNode);
                    gValues.set(neighbor, tentative_g);
                    hValues.set(neighbor, this.heuristic(neighbor, target));
                    fValues.set(neighbor, gValues.get(neighbor)! + hValues.get(neighbor)!);

                    if (!openList.includes(neighbor)) {
                        openList.push(neighbor);
                    }
                }
            }
        }
        return null;
    }

    /**
     * Finds a path between two positions in a grid.
     *
     * This method computes the path by converting the 3D start and optional end positions to their respective grid node indices.
     * If the end position is not provided, it defaults to the center of the 'endNode'.
     * After obtaining the 2D grid node indices for the start and end positions, it calls the 'findPath' method to get the path between the two nodes.
     *
     * @param start {Vector3} - The 3D position representing the starting point of the path.
     * @param end {Vector3} [optional] - The 3D position representing the ending point of the path. If not provided, it defaults to the center of the 'endNode'.
     *
     * @returns {MMNode[] | null} - Returns an array of MMNode representing the path, or null if the path cannot be determined.
     */
    findPathByPosition(start: Vector3, end?: Vector3): MMNode[] | null {
        if (!this.endNode) return null;
        if (!this.endNode.center) return null;
        if (!end) end = this.endNode.center;

        const startPosition = gridPositionFromVector(start);
        const endPosition = gridPositionFromVector(end);

        return this.findPath(this.grid[startPosition.x][startPosition.y], this.grid[endPosition.x][endPosition.y]);
    }

    /**
     * Finds a path to the nearest desired node type starting from a given position.
     *
     * This function looks for the shortest path from a starting position to any
     * node of a specified type.
     *
     * @param startPosition - The starting 3D position.
     * @param desiredNodeType - The desired MMGridType to find.
     * @returns An array of nodes representing the path to the nearest desired node type, or null if no path is found.
     */
    findPathToClosestBlockType(startPosition: Vector3, desiredNodeType: MMGridType): MMNode[] | null {
        const openList: MMNode[] = [];
        const closedList: Set<MMNode> = new Set();

        const start = gridPositionFromVector(startPosition);
        const startNode = this.grid[start.x][start.y];

        const gValues: Map<MMNode, number> = new Map();
        const fValues: Map<MMNode, number> = new Map();
        const parents: Map<MMNode, MMNode> = new Map();

        gValues.set(startNode, 0);
        fValues.set(startNode, 0);

        openList.push(startNode);

        while (openList.length > 0) {
            openList.sort((a, b) => fValues.get(a)! - fValues.get(b)!);
            const currentNode = openList.shift()!;

            if (currentNode.type === desiredNodeType) {
                return this.constructPathWithParents(currentNode, parents);
            }

            closedList.add(currentNode);

            const neighbors = this.getNeighbors(currentNode);
            for (const neighbor of neighbors) {
                if (!neighbor.npcWalkable || closedList.has(neighbor)) {
                    continue;
                }

                const tentative_g = gValues.get(currentNode)! + 1;
                if (!openList.includes(neighbor) || tentative_g < gValues.get(neighbor)!) {
                    parents.set(neighbor, currentNode);
                    gValues.set(neighbor, tentative_g);
                    fValues.set(neighbor, tentative_g);

                    if (!openList.includes(neighbor)) {
                        openList.push(neighbor);
                    }
                }
            }
        }
        return null;
    }

    /**
     * Computes the heuristic value for a given node relative to a target node.
     * Uses Manhattan distance in this implementation.
     * @param node - The current node.
     * @param target - The target node.
     * @returns The heuristic value.
     */
    private heuristic(node: MMNode, target: MMNode): number {
        return Math.abs(node.x - target.x) + Math.abs(node.y - target.y);
    }

    /**
     * Gets the neighboring nodes of a given node.
     * This implementation gets the 4 immediate neighbors (no diagonals).
     * @param node - The current node.
     * @returns An array of neighboring nodes.
     */
    private getNeighbors(node: MMNode): MMNode[] {
        const neighbors: MMNode[] = [];
        const dx = [-1, 1, 0, 0];
        const dy = [0, 0, -1, 1];

        for (let i = 0; i < 4; i++) {
            const newX = node.x + dx[i];
            const newY = node.y + dy[i];

            if (newX >= 0 && newX < this.grid.length && newY >= 0 && newY < this.grid[0].length) {
                neighbors.push(this.grid[newX][newY]);
            }
        }

        return neighbors;
    }

    /**
     * Fetches all the neighbors (including diagonals) of a given node.
     *
     * This function retrieves all 8 surrounding nodes of a given node, if they exist.
     *
     * @param node - The node for which neighbors are to be fetched.
     * @returns An array of MMNode representing all neighbors.
     */
    private getAllNeighbors(node: MMNode): MMNode[] {
        const neighbors: MMNode[] = [];
        const dx = [-1, -1, -1, 0, 0, 1, 1, 1];
        const dy = [-1, 0, 1, -1, 1, -1, 0, 1];

        for (let i = 0; i < 8; i++) {
            const newX = node.x + dx[i];
            const newY = node.y + dy[i];

            if (newX >= 0 && newX < this.grid.length && newY >= 0 && newY < this.grid[0].length) {
                neighbors.push(this.grid[newX][newY]);
            }
        }

        return neighbors;
    }

    /**
     * Constructs the path from a given node backtracking through its parents.
     * @returns An array of nodes representing the path.
     * @param endNode
     * @param parents
     */
    private constructPathWithParents(endNode: MMNode, parents: Map<MMNode, MMNode>): MMNode[] {
        const path: MMNode[] = [];
        const visited: Set<MMNode> = new Set();

        let currentNode: MMNode | undefined = endNode;

        while (currentNode) {
            if (visited.has(currentNode)) {
                console.error("Pathfinding error: Cycle detected in path.");
                break;
            }

            path.unshift(currentNode);
            visited.add(currentNode);
            currentNode = parents.get(currentNode) || undefined;
        }
        return path;
    }
}

export type MMNode = {
    x: number;
    y: number;
    walkable: boolean;
    npcWalkable: boolean;
    parent?: MMNode;
    center: Vector3;
    type: MMGridType;
};
