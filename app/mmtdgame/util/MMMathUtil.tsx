import {Vector2, Vector3} from "three";
import {GRID_SIZE_HEIGHT, GRID_SIZE_WIDTH} from "../grid/MMGridManager";
// import Game from "@app/mmtdgame/MMTDGame";

export const gridPositionFromVector = (position: Vector3): Vector2 => {
    // const canvasSize = Game.canvasSize;
    // const cellSize = new Vector2(1, 1);

    return new Vector2(
        Math.round(position.x + GRID_SIZE_WIDTH / 2 - 0.5),
        Math.round(-position.y + GRID_SIZE_HEIGHT / 2 - 0.5)
    )

    // return new Vector2(
    //     Math.round((position.x + canvasSize.width / 2 - cellSize.x / 2) / cellSize.x),
    //     Math.round((-position.y + canvasSize.height / 2 - cellSize.y / 2) / cellSize.y));
}
