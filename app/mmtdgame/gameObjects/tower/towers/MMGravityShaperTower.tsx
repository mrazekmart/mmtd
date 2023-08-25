import {MMATower} from "../MMATower";
import * as THREE from "three";
import {Vector2, Vector3} from "three";
import {MMProjectileType} from "../../projectiles/MMProjectileManager";
import Game from "@app/mmtdgame/MMTDGame";

export class MMGravityShaperTower extends MMATower {

    weaponFireRate: number = 0.2; // shots per sec
    timeToShoot: number = 1 / this.weaponFireRate;
    currentTimeToShoot: number = this.timeToShoot;

    constructor(gridPosition: Vector2, position: Vector3) {
        super();
        this.gridPosition = gridPosition;

        const buildingGeometry = new THREE.BoxGeometry(60, 60, 2);
        const buildingMaterial = new THREE.MeshBasicMaterial({color: 0xDC143C});
        const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
        buildingMesh.position.set(position.x, position.y, position.z);
        this.meshes.push(buildingMesh);

        const weaponGeometry = new THREE.BoxGeometry(20, 20, 40);
        const weaponMaterial = new THREE.MeshBasicMaterial({color: 0x008B8B});
        const weaponMesh = new THREE.Mesh(weaponGeometry, weaponMaterial);
        weaponMesh.position.set(position.x, position.y, position.z);
        this.meshes.push(weaponMesh);

        this.addMeToScene();
    }

    createProjectile() {
        const weaponMesh: THREE.Mesh = this.meshes[1];
        Game.managers.projectile.createProjectile(MMProjectileType.GravityShaper, weaponMesh.position, this.target);
    }
}