import * as BIG from 'big.js';
import { Transaction } from 'src/app/types/transaction.type';

const { Big } = BIG;

export interface CoinInterface {
  name: string;
  totalCoins: number;
  totalInvested: number;

  totalCost: number;
  totalCostAfterFees: number;

  avgBuyPrice: number;
  avgBuyPriceAfterFees: number;

  totalProfit: number;
  totalProfitAfterFees: number;

  currentProfit: number;
  currentProfitAfterFees: number;

  prcCurrentProfit: number;
  prcCurrentProfitAfterFees: number;

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

  #totalInvested = 0;
  get totalInvested() {
    return this.#totalInvested;
  }

  get totalCost() {
    return new Big(this.totalCoins).times(this.marketPrice).toNumber();
  }

  get totalCostAfterFees() {
    const price = new Big(this.totalCoins).times(this.marketPrice);
    const feesAmount = price.times(this.#fees);
    return price.minus(feesAmount).toNumber();
  }

  #avgBuyPrice = 0;
  get avgBuyPrice() {
    return this.#avgBuyPrice;
  }

  #avgBuyPriceAfterFees = 0;
  get avgBuyPriceAfterFees() {
    return this.#avgBuyPriceAfterFees;
  }

  #currentProfit = 0;
  get currentProfit() {
    return this.#currentProfit;
  }

  #currentProfitAfterFees = 0;
  get currentProfitAfterFees() {
    return this.#currentProfitAfterFees;
  }

  get prcCurrentProfit() {
    if (this.totalCoins && this.avgBuyPrice) {
      return new Big(this.marketPrice)
        .minus(this.avgBuyPrice)
        .div(this.avgBuyPrice)
        .times(100)
        .toNumber();
    }
    return 0;
  }

  get prcCurrentProfitAfterFees() {
    if (this.totalCoins && this.avgBuyPriceAfterFees) {
      new Big(this.marketPrice)
        .minus(this.#avgBuyPriceAfterFees)
        .div(this.#avgBuyPriceAfterFees)
        .times(100)
        .toNumber();
    }
    return 0;
  }

  #totalProfit = 0;
  get totalProfit() {
    const currentValue = new Big(this.#marketPrice).times(this.totalCoins);
    return new Big(this.#totalProfit).plus(currentValue).toNumber();
  }

  #totalProfitAfterFees = 0;
  get totalProfitAfterFees() {
    const currentValue = new Big(this.#marketPrice).times(this.totalCoins);
    const feesAmount = currentValue.times(this.#fees);
    const currentValueAfterFees = currentValue.minus(feesAmount);
    return new Big(this.#totalProfitAfterFees).plus(currentValueAfterFees).toNumber();
  }

  #priceOfProfit = 0;
  get priceOfProfit() {
    if (this.#priceOfProfit === 0 && this.avgBuyPrice && this.#fees) {
      this.#priceOfProfit = new Big(this.avgBuyPrice).div(new Big(1).minus(this.#fees)).toNumber();
    }
    return this.#priceOfProfit;
  }

  #marketPrice = 0;
  set marketPrice(v: number) {
    this.#marketPrice = v;
    this.#calcPCurrentProfit();
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
      const qty = new Big(tx.FilledQuantity);
      const qtyAfterFees = new Big(tx.FilledQuantity).minus(tx.Fees);

      this.#avgBuyPrice = new Big(this.#avgBuyPrice)
        .times(this.#totalCoins)
        .plus(tx.FilledValue)
        .div(new Big(this.#totalCoins).plus(qty))
        .toNumber();

      this.#avgBuyPriceAfterFees = new Big(this.#avgBuyPriceAfterFees)
        .times(this.#totalCoins)
        .plus(tx.FilledValue)
        .div(new Big(this.#totalCoins).plus(qtyAfterFees))
        .toNumber();

      this.#totalCoins = new Big(this.#totalCoins).plus(qty).toNumber();
      this.#totalInvested = new Big(this.#totalInvested).plus(tx.FilledValue).toNumber();
    }

    if (tx.Direction === 'SELL') {
      /* {
        Direction: 'SELL',
        ExecFeeV2: '0.02185297812',
        Fees: '0.02185297812000000000',
        'Filled Price': '4547.02000000000000000000',
        'Filled Quantity': '0.00267000000000000000',
        'Filled Value': '12.14054340000000000000',
        'Order No.': ' 37007104',
        'Order Type': 'MARKET',
        'Spot Pairs': 'ETHUSDT',
        'Timestamp (UTC)': '12:34 2025-08-14',
        'Transaction ID': '2280000001269054069',
        feeCoin: 'USDT',
      } */
      this.#totalCoins = new Big(this.#totalCoins).minus(tx.FilledQuantity).toNumber();

      if (this.#totalCoins < 0) {
        this.#totalCoins = 0;
      }

      this.#totalInvested = new Big(this.#totalInvested).minus(tx.FilledValue).toNumber();
      if (this.#totalInvested < 0) {
        this.#totalInvested = 0;
      }

      this.#totalProfit = new Big(this.#totalProfit).plus(tx.FilledValue).toNumber();
      this.#totalProfitAfterFees = new Big(this.#totalProfitAfterFees)
        .plus(tx.FilledValue)
        .minus(tx.Fees)
        .toNumber();
    }

    this.#calcPCurrentProfit();
  }

  #calcPCurrentProfit(): void {
    if (this.#totalCoins === 0) {
      return;
    }

    const currentValue = new Big(this.#marketPrice).times(this.#totalCoins);
    const investedValue = new Big(this.#avgBuyPrice).times(this.#totalCoins);

    this.#currentProfit = currentValue.minus(investedValue).toNumber();
  }
}
