import * as THREE from 'three';
import {Vector2, Vector3} from 'three';
import {GRID_SIZE_HEIGHT, GRID_SIZE_WIDTH} from "./MMGridManager";
import {MMGridMesh, MMGridType} from "./MMGridMesh";


export class MMGridCell {
    gridPosition: Vector2;
    gridMesh: MMGridMesh;


    constructor(gridPosition: Vector2, _removed: Vector2, gridType: MMGridType, walkable: boolean) {
        this.gridPosition = gridPosition;

        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({color: 0x643506, side: THREE.DoubleSide});

        const position: Vector3 = new Vector3(
             gridPosition.x - (GRID_SIZE_WIDTH) / 2 + 0.5,
            -gridPosition.y + (GRID_SIZE_HEIGHT) / 2 - 0.5,
            0
        );

        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0x000000}));
        line.position.set(position.x, position.y, position.z);

        const newMesh = new THREE.Mesh(geometry, material);
        newMesh.position.set(position.x, position.y, position.z);

        this.gridMesh = new MMGridMesh(newMesh, line, gridType, walkable);
        this.gridMesh.applyMaterial();
    }

    changeGridType() {
        if (this.gridMesh.gridType === 5) {
            this.gridMesh.gridType = 0;
        } else {
            this.gridMesh.gridType++;
        }
        this.gridMesh.applyMaterial();
    }
}