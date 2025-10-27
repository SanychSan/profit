import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { StorageService } from 'src/app/services/storage.service';
import { BybitAPITx } from 'src/app/types/transaction.type';
import { encryptString, decryptString, hmacSHA256 } from 'src/app/utils/crypto';

interface Response<T> {
  result: T;
  retCode: number;
  retExtInfo: Record<string, any>;
  retMsg: string;
  time: number;
}

interface TransactionsLog {
  list: BybitAPITx[];
  nextPageCursor: string | null;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable({
  providedIn: 'root'
})
export class BybitAPITxsService {
  private readonly STORAGE_KEY = 'bybitApi';
  private http = inject(HttpClient);
  private baseUrl = 'https://api.bybit.com';
  private storageService = inject(StorageService);

  public apiKey: WritableSignal<string> = signal('');
  public apiKey2: WritableSignal<string> = signal('');
  public lastUpdate: WritableSignal<null | number> = signal(null);
  public txs: WritableSignal<BybitAPITx[]> = signal([]);

  public isLoading = signal(false);

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    // // load mock data
    // this.isLoading.set(true);
    // await this.storageService.remove(this.STORAGE_KEY);
    // const { default: data } = await import('src/mock/data.api');
    // const rawData = (data as BybitAPITx[]).sort((a, b) => {
    //   const t1 = a.tradeId;
    //   const t2 = b.tradeId;
    //   if (t1 < t2) return -1;
    //   if (t1 > t2) return 1;
    //   return 0;
    // });
    // this.txs.set(rawData || []);
    // this.storageService.set(this.STORAGE_KEY, rawData);
    // console.log('%cbybit mock>', 'color:orange', rawData);
    // this.isLoading.set(false);

    // const LINKUSDT = rawData
    //   .filter((tx: BybitAPITx) => tx.symbol === 'LINKUSDT')
    //   .filter(tx => tx.currency !== 'USDT');
    // console.log('%cLINKUSDT', 'color:orange', LINKUSDT);

    // Load stored data
    try {
      const apiKey = (await this.storageService.get<string>(`${this.STORAGE_KEY}.apiKey`)) || '';
      this.apiKey.set(apiKey);

      const secretKeyEnc =
        (await this.storageService.get<string>(`${this.STORAGE_KEY}.apiKey2`)) || '';
      const secretKey = await decryptString(secretKeyEnc);
      this.apiKey2.set(secretKey);

      const lastUpdate =
        (await this.storageService.get<number>(`${this.STORAGE_KEY}.lastUpdate`)) || null;
      this.lastUpdate.set(lastUpdate);

      const txs = (await this.storageService.get<BybitAPITx[]>(`${this.STORAGE_KEY}.txs`)) || [];
      this.txs.set(txs);
    } catch (error) {}
  }

  public async syncData(
    _endTime?: number,
    cursor?: string,
    allData: BybitAPITx[] = []
  ): Promise<void> {
    this.isLoading.set(true);

    const endTime = _endTime || Date.now();
    const startTime = endTime - SEVEN_DAYS_MS;
    const limit = 50;

    const params = new URLSearchParams({
      category: 'spot',
      startTime: `${startTime}`,
      endTime: `${endTime}`,
      limit: `${limit}`
    });

    if (cursor) {
      params.append('cursor', cursor);
    }

    const timestamp = Date.now().toString();
    const recv_window = '5000';
    const sign = timestamp + this.apiKey() + recv_window + params.toString();
    const sig = await hmacSHA256(sign, this.apiKey2());

    this.http
      .get<Response<TransactionsLog>>(`${this.baseUrl}/v5/account/transaction-log`, {
        params: new HttpParams({ fromString: params.toString() }),
        headers: {
          'X-BAPI-API-KEY': this.apiKey(),
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
      .subscribe(res => {
        // console.log('%cbybit>', 'color:lime', res);
        if (res.retMsg === 'OK') {
          const data = [...allData, ...res.result.list];

          if (res.result.list.length === limit && res.result.nextPageCursor) {
            this.syncData(endTime, res.result.nextPageCursor, data);
          } else if (this.lastUpdate()) {
            if (startTime > (this.lastUpdate() as number)) {
              this.syncData(startTime, undefined, data);
            } else {
              this.stopLoading(data);
            }
          } else {
            this.syncData(startTime, undefined, data);
          }
        } else {
          this.stopLoading(allData);
        }
      });
  }

  private stopLoading(_data: BybitAPITx[]): void {
    const data = [..._data]
      .filter(
        (obj, index, self) =>
          index === self.findIndex(o => o.tradeId === obj.tradeId && o.symbol === obj.symbol)
      )
      .sort((a, b) => {
        const t1 = a.tradeId;
        const t2 = b.tradeId;
        if (t1 < t2) return -1;
        if (t1 > t2) return 1;
        return 0;
      });
    this.txs.set(data);
    this.storageService.set<BybitAPITx[]>(`${this.STORAGE_KEY}.txs`, data);
    const now = Date.now();
    this.lastUpdate.set(now);
    this.storageService.set<number>(`${this.STORAGE_KEY}.lastUpdate`, now);
    this.isLoading.set(false);
    console.log('%cbybit>', 'color:lime', data);
  }

  public async setApiCredentials(apiKey: string, secretKey: string): Promise<void> {
    await this.storageService.set<string>(`${this.STORAGE_KEY}.apiKey`, apiKey);

    const encryptedSecretKey = await encryptString(secretKey);
    await this.storageService.set<string>(`${this.STORAGE_KEY}.apiKey2`, encryptedSecretKey);

    this.apiKey.set(apiKey);
    this.apiKey2.set(secretKey);
  }
}
