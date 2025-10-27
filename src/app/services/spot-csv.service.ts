import { Injectable, WritableSignal, signal, inject, effect, DestroyRef } from '@angular/core';

import { CoinsPriceService } from './coins-price.service';
import { BybitCSVTxsService } from './bybit-csv-txs.service';
import { BybitCSVTx } from 'src/app/types/transaction.type';
import { Coin } from 'src/app/classes/coin';
import { ServiceState } from 'src/app/types/service-state.type';
import { bybitCsvTxToCoinTx } from 'src/app/utils/bybit-tx-to-coin-tx';

@Injectable({
  providedIn: 'root'
})
export class SpotCsvService {
  private coinsPriceService = inject(CoinsPriceService);
  private bybitCSVTxsService = inject(BybitCSVTxsService);

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
        const transactions: BybitCSVTx[] = this.bybitCSVTxsService.txs();
        const coinsPrice = this.coinsPriceService.coins();

        if (!coinsPrice || Object.keys(coinsPrice).length === 0) {
          return;
        }

        const coins: Coin[] = [];
        for (const tx of transactions) {
          const coinId = tx['Spot Pairs'].replace('USDT', '');
          const coin = coins.find(c => c.name === coinId);
          const coinTx = bybitCsvTxToCoinTx(tx);
          if (coin) {
            coin.addTransaction(coinTx);
          } else {
            const newCoin = new Coin(coinId, coinsPrice[coinId]);
            newCoin.addTransaction(coinTx);
            coins.push(newCoin);
          }
        }

        this.coins.set(coins);
      },
      { injector: inject(DestroyRef) as any }
    );
  }
}
