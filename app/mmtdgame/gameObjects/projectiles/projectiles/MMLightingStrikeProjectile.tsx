import {MMAProjectile} from "../MMAProjectile";
import {MMAEnemy} from "../../enemies/MMAEnemy";
import * as THREE from "three";
import {Vector3} from "three";
import MMTDGame from "@app/mmtdgame/MMTDGame";

type Segment = [THREE.Vector3, THREE.Vector3];

export class MMLightingStrikeProjectile extends MMAProjectile {

    targetEnemy!: MMAEnemy;

    lightningSegments: THREE.Line[] = [];

    damage = 50;

    constructor(position: Vector3, targetEnemy: MMAEnemy) {
        super();
        this.position = position;
        this.targetEnemy = targetEnemy;

        const material = new THREE.LineBasicMaterial({color: 0xFFFFFF});

        let lightningSegments: Segment[] = this.createLightningSegment(this.position, targetEnemy.mesh.position, 1, 3);

        lightningSegments.forEach(segment => {
            const geometry = new THREE.BufferGeometry().setFromPoints(segment);
            const line = new THREE.Line(geometry, material);
            this.lightningSegments.push(line);
        });
        this.addMeToScene();
        targetEnemy.takeDamage(this.damage);
    }

    time = 0;

    update(deltaTime: number) {
        this.time += deltaTime;
        if (this.time > 0.25) {
            this.removeMeFromScene();
            this.time = 0;
        }
    }

    addMeToScene() {
        this.lightningSegments.forEach((segment: THREE.Line) => {
            MMTDGame.managers.scene.addToScene(segment);
        })
    }

    removeMeFromScene() {
        this.lightningSegments.forEach((segment: THREE.Line) => {
            MMTDGame.managers.scene.removeFromScene(segment);
        })
    }


    createLightningSegment(start: THREE.Vector3, end: THREE.Vector3, jitterAmount: number, depth: number): Segment[] {
        if (depth <= 0) {
            return [];
        }

        let midpoint = new THREE.Vector3().lerpVectors(start, end, 0.5);
        midpoint.x += (Math.random() - 0.5) * jitterAmount;
        midpoint.y += (Math.random() - 0.5) * jitterAmount;
        //midpoint.z += (Math.random() - 0.5) * jitterAmount;

        let firstHalf: Segment = [start, midpoint];
        let secondHalf: Segment = [midpoint, end];

        let segments: Segment[] = [firstHalf, secondHalf];

        // Occasional branching:
        if (Math.random() < 0.3) {
            let branchEnd = midpoint.clone();
            branchEnd.x += (Math.random() - 0.5) * jitterAmount;
            branchEnd.y += (Math.random() - 0.5) * jitterAmount;
            //branchEnd.z += (Math.random() - 0.5) * jitterAmount;
            segments.push([midpoint, branchEnd]);

            segments = segments.concat(this.createLightningSegment(midpoint, branchEnd, jitterAmount * 0.5, depth - 1));
        }

        segments = segments.concat(this.createLightningSegment(midpoint, end, jitterAmount * 0.5, depth - 1));

        return segments;
    }
}