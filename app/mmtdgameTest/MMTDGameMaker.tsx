import {Vector2} from 'three';
import {MMGridCell} from "@app/mmtdgame/grid/MMGridCell";
import {MMGridType} from "@app/mmtdgame/grid/MMGridMesh";
import Game from "@app/mmtdgame/MMTDGame";

export class MMTDGameMaker {
    private static instance: MMTDGameMaker;
    gridSize!: Vector2;
    grid!: MMGridCell[][];

    constructor() {
    }

    public static getInstance(): MMTDGameMaker {
        if (!this.instance) {

            this.instance = new MMTDGameMaker();
        }
        return this.instance;
    }

    build(gridSize: Vector2, _removed: Vector2) {
        this.gridSize = gridSize;
        this.grid = new Array(gridSize.x).fill(undefined).map(() => new Array(gridSize.y).fill(undefined));
        this.createGrid(this.gridSize, _removed);
    }

    createGrid(gridSize: Vector2, _removed: Vector2) {

        for (let i = 0; i < gridSize.x; i++) {
            for (let j = 0; j < gridSize.y; j++) {
                this.grid[i][j] = new MMGridCell(new Vector2(i, j), _removed, MMGridType.Ground, true);
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