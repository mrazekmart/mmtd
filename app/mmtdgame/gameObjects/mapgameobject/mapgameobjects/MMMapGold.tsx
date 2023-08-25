import {MMAGameObject} from "@app/mmtdgame/gameObjects/MMAGameObject";
import * as THREE from "three";
import {Vector2, Vector3} from "three";
import {MMTDSceneManager} from "@app/mmtdgame/MMTDSceneManager";
import {MMGameObjectsManager} from "@app/mmtdgame/gameObjects/mapgameobject/MMGameObjectsManager";
import {MMGridManager} from "@app/mmtdgame/grid/MMGridManager";
import {MMGridType} from "@app/mmtdgame/grid/MMGridMesh";
import {MMPathFinder} from "@app/mmtdgame/grid/pathfinding/MMPathFinder";

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
        MMTDSceneManager.getInstance().addToScene(this.mesh);
    }

    removeMeFromScene() {
        MMTDSceneManager.getInstance().removeFromScene(this.mesh);
    }

    destroy() {
        this.removeMeFromScene();
        this.mesh.geometry.dispose();
        MMGameObjectsManager.getInstance().removeGoldObject(this);
        MMGridManager.getInstance().grid[this.gridPosition.x][this.gridPosition.y].gridMesh.gridType = MMGridType.Ground;
        MMGridManager.getInstance().grid[this.gridPosition.x][this.gridPosition.y].gridMesh.applyMaterial();
        MMPathFinder.getInstance().grid[this.gridPosition.x][this.gridPosition.y].type = MMGridType.Ground;
    }
}