import { Injectable, WritableSignal, Signal, computed, signal, inject } from '@angular/core';

import { StorageService } from './storage.service';

import { Transaction, TransactionRaw, TransactionKeys } from 'src/app/types/transaction.type';
// import { getData } from 'src/mock/data';

const CLEAN_KEY_RE = /[.\s]|\(UTC\)/g;

const coerce = (v: unknown): unknown => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const numRe = /^-?(?:\d+\.?\d*|\.\d+)$/;
    if (numRe.test(v)) {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
    return v.trim();
  }
  return v;
};

const transformData = (item: TransactionRaw): Transaction => {
  const out: Transaction = {} as Transaction;
  for (const [key, value] of Object.entries(item)) {
    const cleanKey = key.replace(CLEAN_KEY_RE, '');
    // TODO: develop transformation rules
    (out as any)[cleanKey] = ['OrderNo', 'TransactionID'].includes(cleanKey)
      ? `${value}`.trim()
      : coerce(value);
  }
  return out;
};

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private readonly STORAGE_KEY = 'transactions';
  private storageService = inject(StorageService);
  private rawData: WritableSignal<TransactionRaw[]> = signal([]);

  public spot: Signal<Transaction[]> = computed(() => this.rawData().map(transformData));

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    // load mock data
    // await this.storageService.remove(this.STORAGE_KEY);
    // getData().then(data => {
    //   const rawData = (data as TransactionRaw[]).sort((a, b) => {
    //     const t1 = new Date(a['Timestamp (UTC)']).getTime();
    //     const t2 = new Date(b['Timestamp (UTC)']).getTime();
    //     return t1 - t2;
    //   });
    //   this.rawData.set(rawData || []);
    //   this.storageService.set(this.STORAGE_KEY, rawData);
    // });

    // Load stored data
    try {
      const data = await this.storageService.get<TransactionRaw[]>(this.STORAGE_KEY);
      this.rawData.set(data || []);
    } catch (error) {}
  }

  public async addTransactions(data: TransactionRaw[]): Promise<void> {
    const storedData = (await this.storageService.get<TransactionRaw[]>(this.STORAGE_KEY)) || [];

    const result = [...storedData, ...data]
      .filter(
        // remove duplicates
        (obj, index, self) =>
          index === self.findIndex(o => o['Transaction ID'] === obj['Transaction ID'])
      )
      .sort((a, b) => {
        // const t1 = new Date(a['Timestamp (UTC)']).getTime();
        // const t2 = new Date(b['Timestamp (UTC)']).getTime();
        // return t2 - t1;
        const t1 = `${a['Transaction ID']}`;
        const t2 = `${b['Transaction ID']}`;
        if (t1 < t2) return -1;
        if (t1 > t2) return 1;
        return 0;
      });

    await this.storageService.set(this.STORAGE_KEY, result);
    this.rawData.set(result);
  }

  public async removeAllData(): Promise<void> {
    await this.storageService.remove(this.STORAGE_KEY);
    this.rawData.set([]);
  }

  public validateFormat(data: TransactionRaw[]): boolean {
    if (data.length === 0) {
      return false;
    }

    for (const field of TransactionKeys) {
      if (!(field in data[0])) {
        return false;
      }
    }

    return true;
  }
}
