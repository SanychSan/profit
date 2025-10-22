import * as BIG from 'big.js';
import { Transaction } from 'src/app/types/transaction.type';

const { Big } = BIG;

export interface CoinInterface {
  name: string;
  totalCoins: number;

  totalCost: number;
  avgBuyPrice: number;
  totalProfit: number;
  currentProfit: number;
  prcCurrentProfit: number;

  marketPrice: number;
}

export class Coin implements CoinInterface {
  #fees = 0.001; // 0.1%
  private transactions: Transaction[] = [];
  readonly name: string;

  #totalCoins = 0;
  get totalCoins() {
    return this.#totalCoins;
  }

  get totalCost() {
    return new Big(this.totalCoins).times(this.marketPrice).toNumber();
  }

  #avgBuyPrice = 0;
  get avgBuyPrice() {
    return this.#avgBuyPrice;
  }

  #currentProfit = 0;
  get currentProfit() {
    return this.#currentProfit;
  }

  get prcCurrentProfit() {
    if (this.#currentProfit !== 0 && this.#totalCoins !== 0) {
      const investedValue = new Big(this.#avgBuyPrice).times(this.#totalCoins);
      if (!investedValue.eq(0)) {
        return new Big(this.#currentProfit).div(investedValue).times(100).toNumber();
      }
    }
    return 0;
  }

  #totalProfit = 0;
  get totalProfit() {
    const currentValue = new Big(this.#marketPrice).times(this.#totalCoins);
    const feesAmount = currentValue.times(this.#fees);
    const currentValueAfterFees = currentValue.minus(feesAmount);
    return new Big(this.#totalProfit).plus(currentValueAfterFees).toNumber();
  }

  #priceOfProfit = 0;
  get priceOfProfit() {
    if (this.#priceOfProfit === 0 && !new Big(this.avgBuyPrice).eq(0) && this.#fees) {
      this.#priceOfProfit = new Big(this.avgBuyPrice).div(new Big(1).minus(this.#fees)).toNumber();
    }
    return this.#priceOfProfit;
  }

  #marketPrice = 0;
  set marketPrice(v: number) {
    this.#marketPrice = v;
    this.#currentProfit = this.#calcPCurrentProfit();
  }
  get marketPrice() {
    return this.#marketPrice;
  }

  constructor(name: string, marketPrice: number = 0) {
    this.name = name;
    this.marketPrice = marketPrice;
  }

  addTransaction(tx: Transaction): void {
    this.transactions.push(tx);

    if (tx.Direction === 'BUY') {
      const spent = new Big(tx.FilledValue);
      const qty = new Big(tx.FilledQuantity).minus(tx.Fees);
      // const totalQty = new Big(this.#totalCoins).plus(qty);

      this.#avgBuyPrice = new Big(this.#avgBuyPrice)
        .times(this.#totalCoins)
        .plus(tx.FilledValue)
        .div(new Big(this.#totalCoins).plus(qty))
        .toNumber();
      this.#totalCoins = new Big(this.#totalCoins).plus(qty).toNumber();
      this.#totalProfit = new Big(this.#totalProfit).minus(spent).toNumber();
    }

    if (tx.Direction === 'SELL') {
      const received = new Big(tx.FilledValue).minus(tx.Fees);
      const qty = new Big(tx.FilledQuantity);

      this.#totalCoins = new Big(this.#totalCoins).minus(qty).toNumber();
      if (this.#totalCoins < 0) {
        this.#totalCoins = 0;
        this.#avgBuyPrice = 0;
      }

      this.#totalProfit = new Big(this.#totalProfit).plus(received).toNumber();
    }

    this.#currentProfit = this.#calcPCurrentProfit();
  }

  #calcPCurrentProfit(): number {
    if (this.#totalCoins === 0) {
      return 0;
    }

    const currentValue = new Big(this.#marketPrice).times(this.#totalCoins);
    const feesAmount = currentValue.times(this.#fees);
    const currentValueAfterFees = currentValue.minus(feesAmount);

    const investedValue = new Big(this.#avgBuyPrice).times(this.#totalCoins);

    return currentValueAfterFees.minus(investedValue).toNumber();
  }
}
