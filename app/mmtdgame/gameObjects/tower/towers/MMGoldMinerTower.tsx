import {MMATower} from "@app/mmtdgame/gameObjects/tower/MMATower";
import * as THREE from "three";
import {Vector2, Vector3} from "three";
import {MMMiner} from "@app/mmtdgame/gameObjects/tower/npc/MMMiner";

export class MMGoldMinerTower extends MMATower {

    miners: MMMiner[] = [];

    constructor(gridPosition: Vector2, position: Vector3) {
        super();
        this.gridPosition = gridPosition;

        const buildingGeometry = new THREE.CircleGeometry(30, 16);
        const buildingMaterial = new THREE.MeshBasicMaterial({color: 0x008000});
        const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
        buildingMesh.position.set(position.x, position.y, position.z);
        this.meshes.push(buildingMesh)

        const weaponGeometry = new THREE.BoxGeometry(15, 15, 10);
        const weaponMaterial = new THREE.MeshBasicMaterial({color: 0x4B0082});
        const weaponMesh = new THREE.Mesh(weaponGeometry, weaponMaterial);
        weaponMesh.position.set(position.x, position.y, position.z);
        this.meshes.push(weaponMesh)

        this.addMeToScene();
        this.createMiner();
    }

    public update(delta: number): void {
        this.miners.forEach((miner: MMMiner) => {
            miner.update(delta);
        });
    }

    createMiner() {
        const miner = new MMMiner(this.gridPosition, this.meshes[0].position);
        this.miners.push(miner);
    }
}