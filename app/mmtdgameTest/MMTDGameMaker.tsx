import {Vector2} from 'three';
import {MMGridCell} from "@app/mmtdgame/grid/MMGridCell";
import {MMGridType} from "@app/mmtdgame/grid/MMGridMesh";
import {MMTDSceneManager} from "@app/mmtdgame/MMTDSceneManager";


export class MMTDGameMaker {
    private static instance: MMTDGameMaker;
    gridSize!: Vector2;
    cellSize!: Vector2;
    grid!: MMGridCell[][];

    constructor() {
    }

    public static getInstance(): MMTDGameMaker {
        if (!this.instance) {

            this.instance = new MMTDGameMaker();
        }
        return this.instance;
    }

    public static build(gridSize: Vector2, cellSize: Vector2) {
        this.gridSize = gridSize;
        this.cellSize = cellSize;
        this.grid = new Array(gridSize.x).fill(undefined).map(() => new Array(gridSize.y).fill(undefined));
        this.createGrid(this.gridSize, this.cellSize);
        return this.getInstance();
    }

    createGrid(gridSize: Vector2, cellSize: Vector2) {

        for (let i = 0; i < gridSize.x; i++) {
            for (let j = 0; j < gridSize.y; j++) {
                this.grid[i][j] = new MMGridCell(new Vector2(i, j), cellSize, MMGridType.Ground, true);
            }
        }
    }

    addMeToScene() {
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                Game.managers.scene.scene.add(this.grid[i][j].gridMesh.mesh);
                Game.managers.scene.scene.add(this.grid[i][j].gridMesh.lineMesh);
            }
        }
    }
}