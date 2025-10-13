import { Injectable, WritableSignal, signal, inject, effect, DestroyRef } from '@angular/core';

import { CoinsPriceService } from './coins-price.service';
import { TransactionsService } from './transactions.service';
import { Coin } from 'src/app/types/coin.type';

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
        const transaction = this.transactionsService.spot();
        const coinsPrice = this.coinsPriceService.coins();
        const tt = transaction.map(tx => ({
          ...tx,
          profit: +(tx.filledValue * (coinsPrice[tx.feeCoin] || 0) - tx.execFeeV2).toFixed(2)
        }));

        console.log('tt', tt);

        const coins = [] as Coin[];
        this.coins.set(coins);
      },
      { injector: inject(DestroyRef) as any }
    );
  }
}
