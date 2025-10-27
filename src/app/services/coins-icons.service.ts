import { Injectable, DestroyRef, inject, effect, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, retry } from 'rxjs';

import { StorageService } from './storage.service';

import { SimplePrice } from 'src/app/types/simple-price.type';

interface CoinIcon {
  id: string;
  name: string;
  symbol: string;
  url: string;
}

interface CoinsData {
  id: string;
  name: string;
  symbol: string;
}

@Injectable({
  providedIn: 'root'
})
export class CoinsIconsService {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private storageService = inject(StorageService);

  private ttlMs = 24 * 60 * 60 * 1000; // cache 24 hours
  private coinListStorageKey = 'coins-list';

  private baseUrl = 'https://api.bybit.com/v5';

  private cachedCoinList: Promise<CoinIcon[]> | null = null;

  coinList = signal<CoinIcon[]>([]);

  constructor() {
    // this.storageService.remove(this.coinListStorageKey);
    effect(
      () => {
        this.getCoinsList();
      },
      { injector: this.destroyRef as any }
    );
  }

  init() {}

  private async getCoinsList(): Promise<CoinIcon[]> {
    // this.http.get('https://api.bybit.com/v5/asset/exchange/query-coin-list').subscribe(res => {

    // });
    if (this.cachedCoinList) {
      return this.cachedCoinList;
    }

    const cachedCoinList = await this.storageService.get<CoinIcon[]>(this.coinListStorageKey);

    if (cachedCoinList) {
      this.cachedCoinList = Promise.resolve(cachedCoinList);
      return this.cachedCoinList;
    }

    this.cachedCoinList = new Promise(resolve => {
      // console.log('Fetching coins list from coingecko...');
      this.http.get<CoinsData[]>('https://api.coingecko.com/api/v3/coins/list').subscribe(data => {
        // id: "ethereum-classic"
        // name: "Ethereum Classic"
        // symbol: "etc"

        // id: "bitcoin"
        // name: "Bitcoin"
        // symbol: "btc"

        const list = data.map(item => ({
          ...item,
          url: `https://cryptologos.cc/logos/${item.id}-${item.symbol}-logo.svg`
        }));

        this.storageService.set<CoinIcon[]>(this.coinListStorageKey, list).then(() => {
          resolve(list);
        });
      });
    });

    return this.cachedCoinList;
  }

  public async getIcon(coinId: string): Promise<string | null> {
    const coinList = await this.getCoinsList();
    const coin = coinList.filter(c => c.symbol === coinId.toLowerCase());
    // console.log('coinList', coin, coinList);
    if (coin) {
      return Promise.resolve('');
    }
    return Promise.resolve(null);
  }

  // private refresh() {
  //   const url = `${this.baseUrl}/market/tickers?category=spot`;

  //   this.http
  //     .get<ApiResponse>(url)
  //     .pipe(
  //       retry({ count: 2, delay: 500 }),
  //       catchError(err => {
  //         console.error('prices error', err);
  //         this.error.set(err?.message ?? 'Failed to load prices');
  //         return of(null as ApiResponse | null);
  //       })
  //     )
  //     .subscribe(data => {
  //       if (data?.retMsg === 'OK' && data.result) {
  //         this.coins.set(this.transformData(data.result.list));
  //         this.error.set(null);
  //       }
  //     });
  // }

  // private transformData(list: PriceEntry[]): SimplePrice {
  //   return list
  //     .filter(d => d.symbol.endsWith('USDT'))
  //     .reduce(
  //       (acc, entry) => ({
  //         ...acc,
  //         [entry.symbol.replace('USDT', '')]: parseFloat(entry.lastPrice)
  //       }),
  //       {} as SimplePrice
  //     );
  // }
}
