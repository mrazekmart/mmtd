import {MMAGameObject, MMGameObjectType} from "../MMAGameObject";
import {Vector3} from "three";
import * as THREE from "three";
import {MMAEnemy} from "../enemies/MMAEnemy";
import Game from "@app/mmtdgame/MMTDGame";

export abstract class MMAProjectile extends MMAGameObject {
    projectileMesh!: THREE.Mesh;
    position!: Vector3;
    target!: Vector3;
    direction!: Vector3;
    speed: number = 80;
    lifetime: number = 4;
    damage: number = 10;

    protected constructor() {
        super();

    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    interactWithHitObject(enemy: MMAEnemy) {
        enemy.takeDamage(this.damage);
        this.destroy();
    }

    checkForIntersections() {
        const thisBox = new THREE.Box3().setFromObject(this.projectileMesh);
        const enemies = Game.managers.enemy.enemies;

        for (const enemy of enemies) {
            const enemyBox = new THREE.Box3().setFromObject(enemy.mesh);
            if (thisBox.intersectsBox(enemyBox)) {
                this.interactWithHitObject(enemy);
                break;
            }
        }
    }

    destroy() {
        this.removeMeFromScene();
        //don't know if this does something
        this.projectileMesh.geometry.dispose();
        Game.managers.projectile.deleteProjectile(this);
    }

    addMeToScene() {
        Game.managers.scene.addToScene(this.projectileMesh);
    }

    removeMeFromScene() {
        Game.managers.scene.removeFromScene(this.projectileMesh);
    }
}
