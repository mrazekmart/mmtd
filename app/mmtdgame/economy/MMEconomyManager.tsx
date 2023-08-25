export class MMEconomyManager {
    private static instance: MMEconomyManager;

    globalMoney: number = 100;

    private constructor() {
    }

    public static getInstance(): MMEconomyManager {
        if (!this.instance) {

            this.instance = new MMEconomyManager();
        }
        return this.instance;
    }

    public addMoney(amount: number) {
        this.globalMoney += amount;
        console.log("-> this.globalMoney", this.globalMoney);
    }
}