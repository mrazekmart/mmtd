import * as THREE from 'three';
import {Vector2} from 'three';
import {MMTDSceneManager} from "@app/mmtdgame/MMTDSceneManager";
import {MMTDGameMaker} from "@app/mmtdgameTest/MMTDGameMaker";
import {MMEnemyManager} from "@app/mmtdgame/gameObjects/enemies/MMEnemyManager";
import {MMGridType} from "@app/mmtdgame/grid/MMGridMesh";
import {MMTowerManager} from "@app/mmtdgame/gameObjects/tower/MMTowerManager";
import {MMPathFinder} from "@app/mmtdgame/grid/pathfinding/MMPathFinder";
import {MMProjectileManager} from "@app/mmtdgame/gameObjects/projectiles/MMProjectileManager";

export interface MMCellJson {
    gridPosition: Vector2,
    cellSize: Vector2,
    gridType: number,
    gridWalkable: boolean
}

export const CANVAS_WIDTH = 2560;
export const CANVAS_HEIGHT = 1332;
export const GRID_SIZE_WIDTH = 32;
export const GRID_SIZE_HEIGHT = 18;

export const CELL_WIDTH = CANVAS_WIDTH / GRID_SIZE_WIDTH;
export const CELL_HEIGHT = CANVAS_HEIGHT / GRID_SIZE_HEIGHT;


export function initializeThreeGrid(containerID: string, size: number): void {

    const scene: THREE.Scene = MMTDSceneManager.getInstance().scene;

    const canvasWidth = CANVAS_WIDTH;
    const canvasHeight = CANVAS_HEIGHT;

    const camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.z = 1000;
    camera.lookAt(new THREE.Vector3(0, 0, 0));


    const divisionsX = 32;
    const divisionsY = 18;

    const cellWidth = canvasWidth / divisionsX;
    const cellHeight = canvasHeight / divisionsY;


    const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
    document.getElementById(containerID)!.appendChild(renderer.domElement);


    const mmGrid: MMTDGameMaker = MMTDGameMaker.build(new Vector2(divisionsX, divisionsY), new Vector2(cellWidth, cellHeight));
    mmGrid.addMeToScene();

    const saveButtonGeometry = new THREE.PlaneGeometry(100, 100);
    const saveButtonMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF, side: THREE.DoubleSide});
    const saveButtonMesh = new THREE.Mesh(saveButtonGeometry, saveButtonMaterial);
    saveButtonMesh.position.set(0, 720, 0);
    saveButtonMesh.name = "savebutton";
    scene.add(saveButtonMesh);

    const placeEnemyButtonGeometry = new THREE.PlaneGeometry(100, 100);
    const placeEnemyButtonMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF, side: THREE.DoubleSide});
    const placeEnemyButtonMesh = new THREE.Mesh(placeEnemyButtonGeometry, placeEnemyButtonMaterial);
    placeEnemyButtonMesh.position.set(130, 720, 0);
    placeEnemyButtonMesh.name = "placeenemybutton";
    scene.add(placeEnemyButtonMesh);

    const placeTowerButtonGeometry = new THREE.PlaneGeometry(100, 100);
    const placeTowerButtonMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF, side: THREE.DoubleSide});
    const placeTowerButtonMesh = new THREE.Mesh(placeTowerButtonGeometry, placeTowerButtonMaterial);
    placeTowerButtonMesh.position.set(-130, 720, 0);
    placeTowerButtonMesh.name = "placetower";
    scene.add(placeTowerButtonMesh);

    let isPlacingEnemy = false;
    let isPlacingTower = false;


    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const meshes: THREE.Mesh[] = [];
    const f = mmGrid.grid;
    f.forEach(row => {
        row.forEach(cell => {
            meshes.push(cell.gridMesh.mesh);
        });
    });

    mmGrid.addMeToScene();
    meshes.push(saveButtonMesh);
    meshes.push(placeEnemyButtonMesh);
    meshes.push(placeTowerButtonMesh);

    const downloadJSON = (data: any, filename: any) => {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], {type: "application/json"});
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename || "data.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    const saveMap = () => {

        const myData: any = [];

        const gridCurrent = mmGrid.grid;
        gridCurrent.forEach(row => {
            row.forEach(cell => {
                let cellData: MMCellJson = {
                    gridPosition: cell.gridPosition,
                    cellSize: cell.cellSize,
                    gridType: cell.gridMesh.gridType,
                    gridWalkable: cell.gridMesh.walkable
                }
                myData.push(cellData);
            });
        });

        downloadJSON(myData, "myData.json");
    }

    const onClick = (event: MouseEvent) => {
        const canvasBounds = renderer.domElement.getBoundingClientRect();

        // Adjust the mouse coordinates for canvas position and scaling
        mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
        mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const mesh = intersects[0].object;

            if (mesh.name === "savebutton") {
                saveMap();
            }
            if (mesh.name === "placeenemybutton") {
                isPlacingEnemy = !isPlacingEnemy;
                isPlacingTower = false;
            }
            if (mesh.name === "placetower") {
                //this is compromised
                isPlacingTower = !isPlacingTower;
                isPlacingEnemy = false;
            }
            const intersectedCustomObject = mmGrid.grid.flat().find(obj => obj.gridMesh.mesh === mesh);


            if (isPlacingEnemy) {
                if (!intersectedCustomObject) return;

                if (intersectedCustomObject.gridMesh.gridType === MMGridType.Road) {
                    MMEnemyManager.getInstance().createEnemy(intersectedCustomObject.gridMesh.mesh.position);
                }
                return;
            }

            if (isPlacingTower) {
                if (!intersectedCustomObject) return;

                // if (intersectedCustomObject.gridMesh.gridType === MMGridType.Road) {
                //
                //     let randomX = Math.random() * 60 - 30;
                //     let randomY = Math.random() * 60 - 30;
                //     const place = intersectedCustomObject.gridMesh.mesh.position.clone();
                //     place.x += randomX;
                //     place.y += randomY;
                //     MMProjectileManager.getInstance().createProjectile(
                //         MMProjectileType.GravityShaper, place);
                // }
                if (intersectedCustomObject.gridMesh.gridType === MMGridType.Ground) {
                    MMTowerManager.getInstance().createTower(1, intersectedCustomObject.gridPosition, intersectedCustomObject.gridMesh.mesh.position);
                }


                return;
            }

            if (intersectedCustomObject) {
                intersectedCustomObject.changeGridType();
                MMPathFinder.ofGrid(MMTDGameMaker.getInstance().grid);
                MMEnemyManager.getInstance().calculateNewPath();
            }
        }
    };

    document.addEventListener('click', onClick);

    let lastTime: number | undefined;
    let frameCount = 0;
    let fps = 0;
    let fpsDeltaTime = 0;
    const animate = (currentTime: number) => {
        if (!lastTime) {
            lastTime = currentTime;
        }
        frameCount++;


        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        update(deltaTime);

        fpsDeltaTime += deltaTime;
        if (fpsDeltaTime >= 1) {
            fps = frameCount;
            frameCount = 0;
            fpsDeltaTime = 0;
            console.log(fps);
        }

        renderer.render(scene, camera);

        requestAnimationFrame(animate);
    };

    const update = (deltaTime: number) => {
        MMEnemyManager.getInstance().updateEnemies(deltaTime);
        MMTowerManager.getInstance().updateTowers(deltaTime);
        MMProjectileManager.getInstance().updateProjectiles(deltaTime);
    }

    requestAnimationFrame(animate);
}