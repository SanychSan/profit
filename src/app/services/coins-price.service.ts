import { Injectable, DestroyRef, inject, effect, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, retry } from 'rxjs';

import { SimplePrice } from 'src/app/types/simple-price.type';
import { ServiceState } from 'src/app/types/service-state.type';

interface PriceEntry {
  ask1Price: string;
  ask1Size: string;
  bid1Price: string;
  bid1Size: string;
  highPrice24h: string;
  lastPrice: string;
  lowPrice24h: string;
  prevPrice24h: string;
  price24hPcnt: string;
  symbol: string;
  turnover24h: string;
  usdIndexPrice: string;
  volume24h: string;
}

interface ApiResponse {
  result: {
    category: string;
    list: PriceEntry[];
  };
  retCode: number;
  retExtInfo: any;
  retMsg: string;
  time: number;
}

@Injectable({
  providedIn: 'root'
})
export class CoinsPriceService {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private baseUrl = 'https://api.bybit.com/v5';

  coins = signal<SimplePrice | null>(null);
  refreshMs = 10000000; // 10 seconds

  public readonly state = signal<ServiceState>({
    init: false,
    loading: false,
    ready: false,
    error: null
  });

  constructor() {
    this.state.update(state => ({
      ...state,
      init: true
    }));

    effect(
      onCleanup => {
        this.refresh();

        const handle = setInterval(() => this.refresh(), this.refreshMs);
        onCleanup(() => clearInterval(handle));
      },
      { injector: this.destroyRef as any }
    );
  }

  private refresh() {
    const url = `${this.baseUrl}/market/tickers?category=spot`;

    this.state.update(state => ({
      ...state,
      loading: true
    }));

    this.http
      .get<ApiResponse>(url)
      .pipe(
        retry({ count: 2, delay: 500 }),
        catchError(err => {
          console.error('prices error', err);
          return of({ retMsg: err?.message ?? 'Failed to load prices' } as ApiResponse | null);
        })
      )
      .subscribe(data => {
        if (data?.retMsg === 'OK' && data.result) {
          this.coins.set(this.transformData(data.result.list));
          this.state.update(state => ({
            ...state,
            loading: false,
            ready: true,
            error: null
          }));
        } else {
          this.state.update(state => ({
            ...state,
            loading: false,
            error: data?.retMsg || 'Failed to load prices'
          }));
        }
      });
  }

  private transformData(list: PriceEntry[]): SimplePrice {
    return list.reduce(
      (acc, entry) => ({
        ...acc,
        [entry.symbol.replace('USDT', '')]: parseFloat(entry.lastPrice)
      }),
      {} as SimplePrice
    );
  }
}
