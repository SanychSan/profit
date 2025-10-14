import { Injectable, WritableSignal, Signal, computed, signal, inject } from '@angular/core';

import { StorageService } from './storage.service';

import { Transaction, TransactionRaw } from 'src/app/types/transaction.type';

const CLEAN_KEY_RE = /[.\s]|\(UTC\)/g;

function coerce(v: unknown): unknown {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const numRe = /^-?\d+(?:\.\d+)?$/;
    if (numRe.test(v)) {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return v;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private storageService = inject(StorageService);

  private rawData: WritableSignal<TransactionRaw[]> = signal([]);

  public spot: Signal<Transaction[]> = computed(() => {
    const rawData = this.rawData();
    return rawData.map(item => {
      const out: Transaction = {} as Transaction;
      for (const [key, value] of Object.entries(item)) {
        const cleanKey = key.replace(CLEAN_KEY_RE, '');
        (out as any)[cleanKey] = coerce(value);
      }
      return out;
    });
  });

  constructor() {
    /* import('src/data/data').then(module => {
      const data = module.default as TransactionRaw[];
      this.storageService.set('transactions', data);
      this.rawData.set(data);
    }); */

    this.storageService
      .get<TransactionRaw[]>('transactions')
      .then(data => this.rawData.set(data || []));
  }
}
