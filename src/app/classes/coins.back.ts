import * as BIG from 'big.js';
import { Transaction } from 'src/app/types/transaction.type';

const { Big } = BIG;

export class Coin {
  readonly id: string;

  #totalCoins = 0;
  get totalCoins() {
    return this.#totalCoins;
  }

  #totalInvested = 0;
  get totalInvested() {
    return this.#totalInvested;
  }

  #avgPrice = 0;
  get avgPrice() {
    return this.#avgPrice;
  }

  #profit = 0;
  get profit() {
    return this.#profit;
  }

  #totalProfit = 0;
  get totalProfit() {
    const currentValue = new Big(this.#marketPrice).times(this.#totalCoins);
    return new Big(this.#totalProfit).plus(currentValue).toNumber();
  }

  #marketPrice = 0;
  set marketPrice(v: number) {
    this.#marketPrice = v;
    this.#profit = this.#calcProfit();
  }
  get marketPrice() {
    return this.#marketPrice;
  }

  private transactions: Transaction[] = [];

  constructor(id: string, marketPrice: number = 0) {
    this.id = id;
    this.marketPrice = marketPrice;
  }

  addTransaction(tx: Transaction): void {
    this.transactions.push(tx);

    if (tx.Direction === 'BUY') {
      const realQty = new Big(tx.FilledQuantity).minus(tx.Fees).toNumber();

      this.#avgPrice = new Big(this.#avgPrice)
        .times(this.#totalCoins)
        .plus(tx.FilledValue)
        .div(new Big(this.#totalCoins).plus(realQty))
        .toNumber();

      this.#totalInvested = new Big(this.#totalInvested).plus(tx.FilledValue).toNumber();
      this.#totalCoins = new Big(this.#totalCoins).plus(realQty).toNumber();

      this.#totalProfit = new Big(this.#totalProfit).minus(tx.FilledValue).toNumber();
    }

    if (tx.Direction === 'SELL') {
      this.#totalCoins = new Big(this.#totalCoins).minus(tx.FilledQuantity).toNumber();

      if (this.#totalCoins < 0) {
        this.#totalCoins = 0;
      }

      this.#totalInvested = new Big(this.#totalInvested)
        .minus(tx.FilledValue)
        .minus(tx.Fees)
        .toNumber();

      this.#totalProfit = new Big(this.#totalProfit).plus(tx.FilledValue).minus(tx.Fees).toNumber();
    }

    this.#profit = this.#calcProfit();
  }

  #calcProfit(): number {
    if (this.#totalCoins === 0) {
      return 0;
    }

    const currentValue = new Big(this.#marketPrice).times(this.#totalCoins);
    const investedValue = new Big(this.#avgPrice).times(this.#totalCoins);

    return currentValue.minus(investedValue).toNumber();
  }
}
