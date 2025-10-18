import { Injectable, WritableSignal, signal, inject, effect, DestroyRef } from '@angular/core';

import { CoinsPriceService } from './coins-price.service';
import { TransactionsService } from './transactions.service';
import { Transaction } from 'src/app/types/transaction.type';
import { Coin } from 'src/utils/coin';

@Injectable({
  providedIn: 'root'
})
export class SpotService {
  private coinsPriceService = inject(CoinsPriceService);
  private transactionsService = inject(TransactionsService);

  public coins: WritableSignal<Coin[]> = signal([]);

  constructor() {
    effect(
      () => {
        const transactions: Transaction[] = this.transactionsService.spot();
        const coinsPrice = this.coinsPriceService.coins();

        if (transactions.length === 0 || Object.keys(coinsPrice).length === 0) {
          return;
        }

        const sortedTransactions = [...transactions].sort(
          (a, b) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime()
        );

        const coins: Coin[] = [];
        for (const tx of sortedTransactions) {
          const coinId = tx.SpotPairs.replace('USDT', '');
          const coin = coins.find(c => c.id === coinId);
          if (coin) {
            coin.addTransaction(tx);
          } else {
            const newCoin = new Coin(coinId, coinsPrice[coinId]);
            newCoin.addTransaction(tx);
            coins.push(newCoin);
          }
        }

        this.coins.set(coins);
      },
      { injector: inject(DestroyRef) as any }
    );
  }
}
