import {Vector2, Vector3} from "three";
import {MMMapGold} from "@app/mmtdgame/gameObjects/mapgameobject/mapgameobjects/MMMapGold";

export class MMGameObjectsManager {
    private static instance: MMGameObjectsManager;

    goldObjects: MMMapGold[] = [];

    constructor() {
    }

    public static getInstance(): MMGameObjectsManager {
        if (!this.instance) {

            this.instance = new MMGameObjectsManager();
        }
        return this.instance;
    }

    public createGoldObject(gridPosition: Vector2, position: Vector3) {
        const goldObject = new MMMapGold(gridPosition, position);
        this.goldObjects.push(goldObject);
    }

    public removeGoldObject(goldObject: MMMapGold) {
        this.goldObjects = this.goldObjects.filter((gold: MMMapGold) => gold !== goldObject);
    }

    public updateMapGameObjects(deltaTime: number) {
        this.goldObjects.forEach((goldObject: MMMapGold) => {
            goldObject.update(deltaTime);
        });
    }
}