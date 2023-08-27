"use client"

import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
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

class Game extends THREE.EventDispatcher {
    lastFrameTime!: number
    isPaused: boolean = true

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

        // this.canvasSize = { width: window.innerWidth, height: window.innerHeight }
        this.canvasSize = { width: 2560, height: 1332 } // Todo (Tom): Remove this

        // Todo (Tom): Move this to a new MMTDRenderer class
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setSize(this.canvasSize.width, this.canvasSize.height)
        
        this.camera = new THREE.PerspectiveCamera(75, this.canvasSize.width / this.canvasSize.height, 0.1, 1000)
        this.camera.position.z = 10
        this.camera.position.y = -7
        this.camera.lookAt(new THREE.Vector3(0, 0, 0))

        this.controls = new OrbitControls(this.camera, this.renderer.domElement)

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
            event.preventDefault()

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
        if (this.isPaused) return

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
        this.resume()
    }

    pause() {
        this.isPaused = true
    }

    resume() {
        this.isPaused = false
        this.lastFrameTime = 0

        requestAnimationFrame(this.update)
    }

    // Todo: Move this to a new MMMapLoader class (or something like that.. LevelManager perhaps?)
    async loadLevel() {
        try {
            const mmCells = await fetchMMGrid()
            this.managers.grid.build(mmCells)
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
