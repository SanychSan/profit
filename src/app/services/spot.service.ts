import { Injectable, WritableSignal, signal, inject, effect, DestroyRef } from '@angular/core';

import { CoinsPriceService } from './coins-price.service';
import { TransactionsService } from './transactions.service';
import { Transaction } from 'src/app/types/transaction.type';
import { Coin } from 'src/app/classes/coin';
import { ServiceState } from 'src/app/types/service-state.type';

@Injectable({
  providedIn: 'root'
})
export class SpotService {
  private coinsPriceService = inject(CoinsPriceService);
  private transactionsService = inject(TransactionsService);

  public readonly state = signal<ServiceState>({
    init: true,
    loading: false,
    ready: false,
    error: ''
  });

  public coins: WritableSignal<Coin[]> = signal([]);

  constructor() {
    effect(
      () => {
        const coinsPriceState = this.coinsPriceService.state();
        this.state.update(state => ({
          ...state,
          ready: coinsPriceState.ready,
          loading: coinsPriceState.loading
        }));
      },
      { injector: inject(DestroyRef) as any }
    );

    effect(
      () => {
        const transactions: Transaction[] = this.transactionsService.spot();
        const coinsPrice = this.coinsPriceService.coins();

        if (!coinsPrice || Object.keys(coinsPrice).length === 0) {
          return;
        }

        const coins: Coin[] = [];
        for (const tx of transactions) {
          const coinId = tx.SpotPairs.replace('USDT', '');
          const coin = coins.find(c => c.name === coinId);
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
