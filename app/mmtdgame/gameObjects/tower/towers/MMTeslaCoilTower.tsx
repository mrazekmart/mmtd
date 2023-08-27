import {MMATower} from "../MMATower";
import * as THREE from "three";
import {Vector2, Vector3} from "three";
import {MMProjectileType} from "../../projectiles/MMProjectileManager";
import Game from "@app/mmtdgame/MMTDGame";

export class MMTeslaCoilTower extends MMATower {

    weaponMesh: THREE.Mesh

    weaponFireRate: number = 0.4;

    constructor(gridPosition: Vector2, position: Vector3) {
        super();
        this.gridPosition = gridPosition;

        const buildingGeometry = new THREE.CircleGeometry(0.4, 5);
        const buildingMaterial = new THREE.MeshBasicMaterial({color: 0x0000FF});
        const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
        buildingMesh.position.set(position.x, position.y, position.z);
        this.meshes.push(buildingMesh);

        const weaponGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.4);
        const weaponMaterial = new THREE.MeshBasicMaterial({color: 0xFFF8DC});
        const weaponMesh = new THREE.Mesh(weaponGeometry, weaponMaterial);
        weaponMesh.position.set(position.x, position.y, position.z);
        this.meshes.push(weaponMesh);
        this.weaponMesh = weaponMesh;

        const weaponTowerGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.8);
        const weaponTowerMaterial = new THREE.MeshBasicMaterial({color: 0xAAF8DC});
        const weaponTowerMesh = new THREE.Mesh(weaponTowerGeometry, weaponTowerMaterial);
        weaponTowerMesh.position.set(position.x, position.y, position.z);
        this.meshes.push(weaponTowerMesh);

        this.addMeToScene();
    }

    createProjectile() {
        Game.managers.projectile.createProjectile(MMProjectileType.LightingStrike, this.weaponMesh.position, this.target);
    }
}