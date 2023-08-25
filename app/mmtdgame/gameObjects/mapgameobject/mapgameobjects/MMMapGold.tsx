import {MMAGameObject} from "@app/mmtdgame/gameObjects/MMAGameObject";
import * as THREE from "three";
import {Vector2, Vector3} from "three";
import {MMGridType} from "@app/mmtdgame/grid/MMGridMesh";
import Game from "@app/mmtdgame/MMTDGame";

export class MMMapGold extends MMAGameObject {

    gridPosition: Vector2;
    mesh: THREE.Mesh;
    remainingGold: number = 100;


    constructor(gridPosition: Vector2, position: Vector3) {
        super();
        this.gridPosition = gridPosition;

        const goldGeometry = new THREE.BoxGeometry(60, 60, 10);
        const goldMaterial = new THREE.MeshBasicMaterial({color: 0xFFD700});
        const goldMesh = new THREE.Mesh(goldGeometry, goldMaterial);
        goldMesh.position.set(position.x, position.y, position.z);
        this.mesh = goldMesh;

        this.addMeToScene();
    }

    public update(delta: number): void {
    }

    addMeToScene() {
        Game.managers.scene.addToScene(this.mesh);
    }

    removeMeFromScene() {
        Game.managers.scene.removeFromScene(this.mesh);
    }

    destroy() {
        this.removeMeFromScene();
        this.mesh.geometry.dispose();
        Game.managers.gameObjects.removeGoldObject(this);
        Game.managers.grid.grid[this.gridPosition.x][this.gridPosition.y].gridMesh.gridType = MMGridType.Ground;
        Game.managers.grid.grid[this.gridPosition.x][this.gridPosition.y].gridMesh.applyMaterial();
        Game.managers.pathFinder.grid[this.gridPosition.x][this.gridPosition.y].type = MMGridType.Ground;
    }
}