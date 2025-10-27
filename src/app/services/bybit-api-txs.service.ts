import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { StorageService } from 'src/app/services/storage.service';
import { BybitAPITx } from 'src/app/types/transaction.type';
import { encryptString, decryptString } from 'src/app/utils/crypto';

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

interface CryptoSecretKey {
  ciphertext: string;
  iv: string;
  key: string;
}

@Injectable({
  providedIn: 'root'
})
export class BybitAPITxsService {
  private http = inject(HttpClient);
  private baseUrl = 'https://api.bybit.com/v5';
  private readonly STORAGE_KEY = 'bybit_api_txs';
  private storageService = inject(StorageService);

  public apiKey = signal('');
  public secretKey = signal('');
  public txs: WritableSignal<BybitAPITx[]> = signal([]);

  isLoading = signal(false);

  constructor() {
    // this.downloadMockData();
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
      const apiKey = await this.storageService.get<string>('bybit_api_key');
      this.apiKey.set(apiKey || '');
      const cryptoSecretKey = await this.storageService.get<CryptoSecretKey>('bybit_secret_key');
      const secretKey = await decryptString(
        cryptoSecretKey!.ciphertext,
        cryptoSecretKey!.iv,
        cryptoSecretKey!.key
      );
      this.secretKey.set(secretKey);
      const data = await this.storageService.get<BybitAPITx[]>(this.STORAGE_KEY);
      this.txs.set(data || []);
    } catch (error) {}
  }

  public async downloadData(
    _endTime?: number,
    cursor?: string,
    allData: BybitAPITx[] = []
  ): Promise<void> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}/account/transaction-log`;

    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const endTime = _endTime || Date.now();
    const startTime = endTime - sevenDaysMs;
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
    const sig = await this.hmacSHA256(sign);

    this.http
      .get<Response<TransactionsLog>>(url, {
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
        console.log('%cbybit>', 'color:lime', res);
        if (res.retMsg === 'OK') {
          const data = [...allData, ...res.result.list];
          if (res.result.list.length === limit && res.result.nextPageCursor) {
            this.downloadData(endTime, res.result.nextPageCursor, data);
          } /* if (startTime > new Date('2025-10-01').getTime()) */ else {
            this.downloadData(startTime, undefined, data);
          } /*  else {
            this.isLoading.set(false);
            console.log('%cbybit>', 'color:lime', data);
          } */
        } else {
          this.isLoading.set(false);
          console.log('%cbybit>', 'color:lime', allData);
        }
      });
  }

  public async setApiCredentials(apiKey: string, secretKey: string): Promise<void> {
    this.apiKey.set(apiKey);
    this.secretKey.set(secretKey);
    this.storageService.set('bybit_api_key', apiKey);
    const encrypted = await encryptString(secretKey);
    this.storageService.set('bybit_secret_key', encrypted);
  }

  private async hmacSHA256(message: string): Promise<string> {
    const enc = new TextEncoder();
    const dec = new TextDecoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(this.secretKey()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));

    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
