import Game from "@app/mmtdgame/MMTDGame";

export class MMWaveManager {
    private static instance: MMWaveManager;

    waves: number[][] = [
        [40, 0.5], [10, 1], [30, 3]
    ]
    wave: number = 0;

    constructor() {
    }

    public static getInstance(): MMWaveManager {
        if (!this.instance) {

            this.instance = new MMWaveManager();
        }
        return this.instance;
    }

    nextWave() {
        this.startWave(this.wave);
        this.wave++;
    }

    startWave(wave: number) {
        const currentWave: number[] = this.waves[wave];

        let counter = 0;
        const maxSpawns = currentWave[0];
        const delaySec = currentWave[1];

        const spawnEnemies = setInterval(() => {

            Game.managers.enemy.createEnemy(Game.managers.pathFinder.startNode.center);
            counter++;
            if (counter >= maxSpawns) {
                clearInterval(spawnEnemies);
            }
        }, delaySec * 1000)
    }

}