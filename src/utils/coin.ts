import * as BIG from 'big.js';
import { Transaction } from 'src/app/types/transaction.type';

const { Big } = BIG;

export class Coin {
  readonly id: string;

  #qty = 0;
  get qty() {
    return this.#qty;
  }

  #avgPrice = 0;
  get avgPrice() {
    return this.#avgPrice;
  }

  #fixedProfit = 0;
  get fixedProfit() {
    return this.#fixedProfit;
  }

  #profit = 0;
  get profit() {
    return this.#profit;
  }

  #lastProfit = 0;
  get lastProfit() {
    return this.#lastProfit;
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
        .times(this.#qty)
        .plus(new Big(tx.FilledPrice).times(realQty))
        .div(new Big(this.#qty).plus(realQty))
        .toNumber();

      this.#lastProfit = new Big(this.#marketPrice).minus(this.#avgPrice).times(realQty).toNumber();
      this.#qty = new Big(this.#qty).plus(realQty).toNumber();
    }

    if (tx.Direction === 'SELL') {
      this.#qty = new Big(this.#qty).minus(tx.FilledQuantity).toNumber();
      if (this.#qty < 0) {
        this.#qty = 0;
      }

      const realCost = new Big(tx.FilledValue).minus(tx.Fees).toNumber();
      this.#fixedProfit = new Big(this.#fixedProfit)
        .plus(new Big(realCost).minus(new Big(this.#avgPrice).times(tx.FilledQuantity)))
        .toNumber();
    }

    this.#profit = this.#calcProfit();
  }

  #calcProfit() {
    return new Big(this.#fixedProfit)
      .plus(new Big(this.#qty).times(new Big(this.#marketPrice).minus(this.#avgPrice)))
      .toNumber();
  }
}
