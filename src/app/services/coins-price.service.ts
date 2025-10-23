import { Injectable, DestroyRef, inject, effect, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, retry } from 'rxjs';
import { App } from '@capacitor/app';

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
  private url = `${this.baseUrl}/market/tickers?category=spot`;

  coins = signal<SimplePrice | null>(null);
  refreshMs = 15_000; // 15 seconds

  private isVisible = signal<boolean>(true);
  private isActive = signal<boolean>(true);

  public readonly state = signal<ServiceState>({
    init: false,
    loading: false,
    ready: false,
    error: null
  });

  constructor() {
    this.state.update(s => ({ ...s, init: true }));

    // Page Visibility API (browser/PWA)
    const onVis = () => this.isVisible.set(!document.hidden);
    this.isVisible.set(typeof document !== 'undefined' ? !document.hidden : true);
    document.addEventListener('visibilitychange', onVis);
    this.destroyRef.onDestroy(() => document.removeEventListener('visibilitychange', onVis));

    // App state (native app Capacitor)
    const sub = App.addListener('appStateChange', ({ isActive }) => this.isActive.set(isActive));
    this.destroyRef.onDestroy(() => {
      // App.addListener returns a Promise<PluginListenerHandle>, so wait for it and then remove the listener
      sub
        .then(handle => {
          if (handle && typeof (handle as any).remove === 'function') {
            // remove may return a Promise or void depending on platform, handle both
            return (handle as any).remove();
          }
        })
        .catch(err => {
          console.error('Failed to remove appStateChange listener', err);
        });
    });

    effect(
      onCleanup => {
        if (!(this.isVisible() && this.isActive())) return;

        this.refresh();
        const handle = setInterval(() => this.refresh(), this.refreshMs);
        onCleanup(() => clearInterval(handle));
      },
      { injector: this.destroyRef as any }
    );
  }

  public refresh() {
    this.state.update(state => ({
      ...state,
      loading: true
    }));

    this.http
      .get<ApiResponse>(this.url)
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
    return list.reduce((acc, entry) => {
      const key = entry.symbol.replace('USDT', '');
      return {
        ...acc,
        [key]: parseFloat(entry.lastPrice)
      };
    }, {} as SimplePrice);
  }
}
