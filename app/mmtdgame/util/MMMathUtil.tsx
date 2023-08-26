import {Vector2, Vector3} from "three";
import Game from "@app/mmtdgame/MMTDGame";

export const gridPositionFromVector = (position: Vector3): Vector2 => {
    const canvasSize = Game.canvasSize;
    const cellSize = Game.managers.grid.getCellSize();

    return new Vector2(
        Math.round((position.x + canvasSize.width / 2 - cellSize.x / 2) / cellSize.x),
        Math.round((-position.y + canvasSize.height / 2 - cellSize.y / 2) / cellSize.y));
}
