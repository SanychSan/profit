import { Injectable, DestroyRef, inject, effect, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, retry, throwError } from 'rxjs';

import { hmacSHA256 } from 'src/utils/hmac-sha-256';
import { SimplePrice } from 'src/app/types/simple-price.type';

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

  coins = signal<SimplePrice>({});
  error = signal<string | null>(null);
  refreshMs = signal<number>(1_500_000);

  constructor() {
    effect(
      onCleanup => {
        const interval = this.refreshMs();
        this.refresh();
        // this.testAPI();

        const handle = setInterval(() => this.refresh(), interval);
        onCleanup(() => clearInterval(handle));
      },
      { injector: this.destroyRef as any }
    );
  }

  private async testAPI() {
    const url = `${this.baseUrl}/account/wallet-balance`;

    const timestamp = Date.now().toString();
    const api_key = 'lw2IeA0cdwfVqoNJOp';
    const recv_window = '5000';
    const sign = timestamp + api_key + recv_window;
    const sig = await hmacSHA256(sign);

    this.http
      .get(url, {
        headers: {
          'X-BAPI-API-KEY': api_key,
          'X-BAPI-TIMESTAMP': timestamp,
          'X-BAPI-RECV-WINDOW': recv_window,
          'X-BAPI-SIGN': sig
        }
      })
      .pipe(
        catchError(err => {
          console.error('testAPI', err);
          return throwError(() => err);
        })
      )
      .subscribe(res => console.log('testAPI', res));
  }

  private refresh() {
    const url = `${this.baseUrl}/market/tickers?category=spot`;

    this.http
      .get<ApiResponse>(url)
      .pipe(
        retry({ count: 2, delay: 500 }),
        catchError(err => {
          console.error('prices error', err);
          this.error.set(err?.message ?? 'Failed to load prices');
          return of(null as ApiResponse | null);
        })
      )
      .subscribe(data => {
        if (data?.retMsg === 'OK' && data.result) {
          this.coins.set(this.transformData(data.result.list));
          this.error.set(null);
        }
      });
  }

  private transformData(list: PriceEntry[]): SimplePrice {
    return list
      .filter(d => d.symbol.endsWith('USDT'))
      .reduce(
        (acc, entry) => ({
          ...acc,
          [entry.symbol.replace('USDT', '')]: parseFloat(entry.lastPrice)
        }),
        {} as SimplePrice
      );
  }
}
