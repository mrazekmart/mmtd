"use client"

import * as THREE from 'three';
import {MMGridManager} from "./grid/MMGridManager";
import {fetchMMGrid} from "./grid/MMMapLoader";
import {MMPathFinder} from "./grid/pathfinding/MMPathFinder";
import {MMGridCell} from "./grid/MMGridCell";
import {MMEnemyManager} from "./gameObjects/enemies/MMEnemyManager";
import {MMTDSceneManager} from "./MMTDSceneManager";
import {MMTowerManager} from "./gameObjects/tower/MMTowerManager";
import {MMBuilderMode} from "./builder/MMBuilderMode";
import {MMProjectileManager} from "@app/mmtdgame/gameObjects/projectiles/MMProjectileManager";
import {MMGameObjectsManager} from "@app/mmtdgame/gameObjects/mapgameobject/MMGameObjectsManager";
import {MMWaveManager} from "@app/mmtdgame/waves/MMWaveManager";
import { CELL_HEIGHT, CELL_WIDTH, GRID_SIZE_HEIGHT, GRID_SIZE_WIDTH } from './MMTDGameInitializer';

class Game extends THREE.EventDispatcher {
    lastFrameTime!: number

    renderer!: THREE.WebGLRenderer
    camera!: THREE.PerspectiveCamera
    canvasSize!: { width: number, height: number }
    scene!: THREE.Scene
    raycaster!: THREE.Raycaster

    meshes: any = [] // Todo (Tom): Remove this

    managers!: {
        grid: MMGridManager,
        pathFinder: MMPathFinder,
        enemy: MMEnemyManager,
        tower: MMTowerManager,
        projectile: MMProjectileManager,
        gameObjects: MMGameObjectsManager,
        builderMode: MMBuilderMode,
        scene: MMTDSceneManager,
        wave: MMWaveManager,
    }

    constructor() {
        super()
    }

    async init(options: { containerId: string }) {
        this.lastFrameTime = 0
        this.canvasSize = { width: window.innerWidth, height: window.innerHeight }

        // Todo (Tom): Move this to a new MMTDRenderer class
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setSize(this.canvasSize.width, this.canvasSize.height)
        
        this.camera = new THREE.PerspectiveCamera(75, this.canvasSize.width / this.canvasSize.height, 0.1, 1000)
        this.camera.position.z = 1000
        this.camera.lookAt(new THREE.Vector3(0, 0, 0))

        this.raycaster = new THREE.Raycaster()

        this.managers = {
            grid: new MMGridManager(),
            pathFinder: new MMPathFinder(),
            enemy: new MMEnemyManager(),
            tower: new MMTowerManager(),
            projectile: new MMProjectileManager(),
            gameObjects: new MMGameObjectsManager(),
            builderMode: new MMBuilderMode(),
            scene: new MMTDSceneManager(),
            wave: new MMWaveManager(),
        }

        this.update = this.update.bind(this)

        document.getElementById(options.containerId)!.appendChild(this.renderer.domElement)

        // Todo (Tom): Every manager should have init, update and dispose methods
        // Object.values(this.managers).forEach(manager => manager.init())

        this.scene = this.managers.scene.scene

        const onClick = (event: MouseEvent) => {
            const canvasBounds = this.renderer.domElement.getBoundingClientRect();

            // Adjust the mouse coordinates for canvas position and scaling

            const mouse = new THREE.Vector2()
            mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
            mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

            this.raycaster.setFromCamera(mouse, this.camera)

            const intersects = this.raycaster.intersectObjects(this.meshes)

            if (intersects.length > 0) {
                const mesh = intersects[0].object;
                const intersectedCustomObject = this.managers.grid.grid.flat().find(obj => obj.gridMesh.mesh === mesh);

                if (!intersectedCustomObject) return;

                if (this.managers.builderMode.isBuildingMode) {
                    this.managers.builderMode.placeTower(intersectedCustomObject);
                    return;
                }
            }
        };

        document.addEventListener('click', onClick);

        await this.loadLevel()
    }

    dispose() {
        // Object.values(this.managers).forEach(manager => manager.dispose())
    }

    update(frameTime: number) {
        if (!this.lastFrameTime) {
            this.lastFrameTime = frameTime
        }

        const deltaTime = (frameTime - this.lastFrameTime) / 1000
        this.lastFrameTime = frameTime

        this.managers.enemy.updateEnemies(deltaTime)
        this.managers.tower.updateTowers(deltaTime)
        this.managers.projectile.updateProjectiles(deltaTime)
        this.managers.gameObjects.updateMapGameObjects(deltaTime)

        this.renderer.render(this.scene, this.camera)

        requestAnimationFrame(this.update)
    }

    run() {
        requestAnimationFrame(this.update)
    }

    // Todo: Move this to a new MMMapLoader class (or something like that.. LevelManager perhaps?)
    async loadLevel() {
        const divisionsX = GRID_SIZE_WIDTH;
        const divisionsY = GRID_SIZE_HEIGHT;
        const cellWidth = CELL_WIDTH;
        const cellHeight = CELL_HEIGHT;

        try {
            const mmCells = await fetchMMGrid()
            this.managers.grid.build(new THREE.Vector2(divisionsX, divisionsY), new THREE.Vector2(cellWidth, cellHeight), mmCells)
            this.managers.grid.addMeToScene()
            this.meshes = this.managers.grid.grid.flat().map((cell: MMGridCell) => cell.gridMesh.mesh)
            
            this.managers.pathFinder.ofGrid(this.managers.grid.grid)

        } catch (error) {
            console.error('Error fetching MMGridManager:', error)
            throw error
        }
    }
}

const instance = new Game() // singleton
export default instance

// export function initializeThreeGrid(containerID: string): void {
//     const scene: THREE.Scene = Game.managers.scene.scene;

//     const canvasWidth = CANVAS_WIDTH;
//     const canvasHeight = CANVAS_HEIGHT;
//     const divisionsX = GRID_SIZE_WIDTH;
//     const divisionsY = GRID_SIZE_HEIGHT;
//     const cellWidth = CELL_WIDTH;
//     const cellHeight = CELL_HEIGHT;

//     var stats = new Stats();
//     stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
//     document.body.appendChild( stats.dom );


//     const camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);
//     camera.position.z = 1000;
//     camera.lookAt(new THREE.Vector3(0, 0, 0));

//     const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({antialias: true});
//     renderer.setSize(canvasWidth, canvasHeight);
//     document.getElementById(containerID)!.appendChild(renderer.domElement);
    
//     // const controls = new OrbitControls(camera, renderer.domElement)

//     const raycaster = new THREE.Raycaster();
//     const mouse = new THREE.Vector2();


//     const loadMap = async () => {
//         try {
//             await fetchMMGrid(divisionsX, divisionsY, cellWidth, cellHeight, scene);
//         } catch (error) {
//             console.error('Error fetching MMGridManager:', error);
//             throw error;
//         }
//     }


//     const meshes: any = [];
//     let mmgriding: any = [];

//     loadMap().then(r => {
//             Game.managers.grid.grid.flat().forEach((cell: MMGridCell) => meshes.push(cell.gridMesh.mesh));
//             MMPathFinder.ofGrid(Game.managers.grid.grid);
//         }
//     );

//     const onClick = (event: MouseEvent) => {
//         const canvasBounds = renderer.domElement.getBoundingClientRect();

//         // Adjust the mouse coordinates for canvas position and scaling
//         mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
//         mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

//         raycaster.setFromCamera(mouse, camera);

//         const intersects = raycaster.intersectObjects(meshes);

//         if (intersects.length > 0) {
//             const mesh = intersects[0].object;
//             const intersectedCustomObject = Game.managers.grid.grid.flat().find(obj => obj.gridMesh.mesh === mesh);

//             if (!intersectedCustomObject) return;

//             if (Game.managers.builderMode.isBuildingMode) {
//                 Game.managers.builderMode.placeTower(intersectedCustomObject);
//                 return;
//             }
//         }
//     };


//     // resize, maybe some day
//     //
//     window.addEventListener('resize', () => {
//         // let width = window.innerWidth;
//         // let height = window.innerHeight;
//         // renderer.setSize(width, height);
//         // camera.aspect = width / height;
//         // camera.updateProjectionMatrix();

//         // CANVAS_WIDTH = window.innerWidth;
//         // CANVAS_HEIGHT = window.innerHeight;

//         // Keep aspect ratio
//         camera.aspect = window.innerWidth / window.innerHeight;
//         renderer.setSize(window.innerWidth, window.innerHeight)
//         camera.updateProjectionMatrix()

//         camera.position.x += (tempLastWindowWidth - window.innerWidth) / 4;
//         tempLastWindowWidth = window.innerWidth;
//     });
//     document.addEventListener('click', onClick);


//     // let this.lastFrameTime: number | undefined;
//     // const animate = (currentTime: number) => {
//     //     stats.begin();

//     //     if (!this.lastFrameTime) {
//     //         this.lastFrameTime = currentTime;
//     //     }

//     //     const deltaTime = (currentTime - this.lastFrameTime) / 1000;
//     //     this.lastFrameTime = currentTime;

//     //     update(deltaTime);

//     //     renderer.render(scene, camera);

//     //     stats.end();

//     //     requestAnimationFrame(animate);
//     // };

//     // const update = (deltaTime: number) => {
//     //     Game.managers.enemy.updateEnemies(deltaTime);
//     //     Game.managers.tower.updateTowers(deltaTime);
//     //     Game.managers.projectile.updateProjectiles(deltaTime);
//     //     Game.managers.gameObjects.updateMapGameObjects(deltaTime);
//     // }

    // requestAnimationFrame(animate);
// }