import { Injectable, WritableSignal, Signal, computed, signal, inject } from '@angular/core';

import { StorageService } from './storage.service';

import { Transaction, TransactionRaw } from 'src/app/types/transaction.type';
import { getData } from 'src/mock/data';

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
    //     return t2 - t1;
    //   });
    //   this.rawData.set(rawData || []);
    //   this.storageService.set(this.STORAGE_KEY, rawData);
    // });

    // Load stored data
    await new Promise(resolve => setTimeout(resolve, 20000)); // simulate delay
    const data = await this.storageService.get<TransactionRaw[]>(this.STORAGE_KEY);
    this.rawData.set(data || []);
  }

  public async addTransactions(data: TransactionRaw[]): Promise<void> {
    const storedData = (await this.storageService.get<TransactionRaw[]>(this.STORAGE_KEY)) || [];
    const newData = data.filter(
      nd => !storedData.some(cd => cd['Transaction ID'] === nd['Transaction ID'])
    );

    const result = [...storedData, ...newData].sort((a, b) => {
      const t1 = new Date(a['Timestamp (UTC)']).getTime();
      const t2 = new Date(b['Timestamp (UTC)']).getTime();
      return t2 - t1;
    });

    await this.storageService.set(this.STORAGE_KEY, result);
    this.rawData.set(result);
  }
}
