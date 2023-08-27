import {MMAGameObject} from "@app/mmtdgame/gameObjects/MMAGameObject";
import * as THREE from "three";
import {Vector3} from "three";
import {MMNode} from "@app/mmtdgame/grid/pathfinding/MMPathFinder";
import {MMGridType} from "@app/mmtdgame/grid/MMGridMesh";
import {MMMapGold} from "@app/mmtdgame/gameObjects/mapgameobject/mapgameobjects/MMMapGold";
import {MMEconomyManager} from "@app/mmtdgame/economy/MMEconomyManager";
import Game from "@app/mmtdgame/MMTDGame";

export class MMMiner extends MMAGameObject {

    mesh: THREE.Mesh;
    path!: MMNode[] | null;
    targetNode: MMMapGold | null = null;

    startGridPosition!: THREE.Vector2;

    speed: number = 0.8;
    miningSpeed: number = 8;
    timeToMine: number = 1 / this.miningSpeed;
    currentTimeToMine: number = this.timeToMine;

    currentPathNode: number = 0;
    isMining: boolean = false;

    goldStored: number = 0;
    maxGoldStored: number = 40;

    isGoingHome: boolean = false

    constructor(grid: THREE.Vector2, position: THREE.Vector3) {
        super();
        this.startGridPosition = grid;

        const minerGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.15);
        const minerMaterial = new THREE.MeshBasicMaterial({color: 0xA52A2A});
        const minerMesh = new THREE.Mesh(minerGeometry, minerMaterial);
        minerMesh.position.set(position.x, position.y, position.z);
        this.mesh = minerMesh;

        this.addMeToScene();

        this.findNewGold();
    }

    public update(deltaTime: number): void {
        if (this.isMining) {
            this.mine(deltaTime);
            return;
        }

        if (!this.targetNode && !this.isGoingHome) {
            this.findNewGold();
        }

        if (!this.path || this.path.length === 0) return;

        if (this.currentPathNode >= this.path.length) {
            this.isMining = true;
            this.currentPathNode--;
            return;
        }

        if (this.currentPathNode < 0) {
            this.currentPathNode++;
            this.storeGold();
        }

        const closestNodePosition: Vector3 = this.path[this.currentPathNode].center;

        if (this.mesh.position.distanceTo(closestNodePosition) < 0.5) {
            if (this.isGoingHome) {
                this.currentPathNode--;
            } else {
                this.currentPathNode++;
            }
            return;
        }

        const direction = new THREE.Vector3().subVectors(closestNodePosition, this.mesh.position).normalize();
        direction.multiplyScalar(this.speed * deltaTime);
        this.mesh.position.add(direction);
    }

    addMeToScene() {
        Game.managers.scene.addToScene(this.mesh);
    }

    private mine(deltaTime: number) {
        if (this.currentTimeToMine < 1 / this.miningSpeed) {
            this.currentTimeToMine += deltaTime;
            return;
        }

        if (this.targetNode) {
            this.goldStored++;
            //FIXME: this is not accurate
            this.currentTimeToMine = 0;
            if (this.goldStored >= this.maxGoldStored) {
                this.isMining = false;
                this.isGoingHome = true;
            }
            this.targetNode.remainingGold--;
            if (this.targetNode.remainingGold <= 0) {
                this.targetNode.destroy();
                this.isGoingHome = true;
                this.isMining = false;
                this.targetNode = null;
            }
        }
    }

    private storeGold() {
        this.isGoingHome = false;
        MMEconomyManager.getInstance().addMoney(this.goldStored);
        this.goldStored = 0;
    }

    findNewGold() {
        this.path = Game.managers.pathFinder.findPathToClosestBlockType(this.mesh.position, MMGridType.Gold);

        if (!this.path) return;

        if (this.path.length > 0) {
            Game.managers.gameObjects.goldObjects.forEach((goldObject: MMMapGold) => {
                if (!this.path) return;

                if (this.path[this.path.length - 1]) {
                    if (goldObject.gridPosition.x === this.path[this.path.length - 1].x && goldObject.gridPosition.y === this.path[this.path.length - 1].y) {
                        this.targetNode = goldObject;
                    }
                }
            });
        }
    }
}