import { Injectable, WritableSignal, signal, inject } from '@angular/core';
import { Papa } from 'ngx-papaparse';

import { BybitCSVTx, BybitCSVTxKeys } from 'src/app/types/transaction.type';
import { StorageService } from 'src/app/services/storage.service';
// import { getData } from 'src/mock/data';

@Injectable({
  providedIn: 'root'
})
export class BybitCSVTxsService {
  private readonly STORAGE_KEY = 'bybit_csv_txs';
  private papa = inject(Papa);
  private storageService = inject(StorageService);
  public txs: WritableSignal<BybitCSVTx[]> = signal([]);

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    // load mock data
    // await this.storageService.remove(this.STORAGE_KEY);
    // getData().then(data => {
    //   const rawData = (data as BybitCSVTx[]).sort((a, b) => {
    //     const t1 = new Date(a['Timestamp (UTC)']).getTime();
    //     const t2 = new Date(b['Timestamp (UTC)']).getTime();
    //     return t1 - t2;
    //   });
    //   this.rawData.set(rawData || []);
    //   this.storageService.set(this.STORAGE_KEY, rawData);
    // });

    // Load stored data
    try {
      const data = await this.storageService.get<BybitCSVTx[]>(this.STORAGE_KEY);
      this.txs.set(data || []);
    } catch (error) {}
  }

  public async addTxFiles(files: FileList): Promise<void> {
    const data: BybitCSVTx[] = await Promise.all(
      Array.from(files).map(file => {
        return new Promise<any[]>(resolve => {
          this.papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: result => {
              resolve(this.validateFormat(result.data) ? result.data : []);
            },
            error: err => {
              console.error('Parse error:', err);
              resolve([]);
            }
          });
        });
      })
    ).then((res: BybitCSVTx[][]) => {
      return ([] as any[]).concat(...res);
    });

    const storedData = (await this.storageService.get<BybitCSVTx[]>(this.STORAGE_KEY)) || [];

    const txs = [...storedData, ...data]
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

    await this.storageService.set(this.STORAGE_KEY, txs);
    this.txs.set(txs);
  }

  public async removeAllData(): Promise<void> {
    await this.storageService.remove(this.STORAGE_KEY);
    this.txs.set([]);
  }

  private validateFormat(data: BybitCSVTx[]): boolean {
    if (data.length === 0) {
      return false;
    }

    for (const field of BybitCSVTxKeys) {
      if (!(field in data[0])) {
        return false;
      }
    }

    return true;
  }
}
