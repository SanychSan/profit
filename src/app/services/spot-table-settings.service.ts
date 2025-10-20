import { Injectable, WritableSignal, signal, inject, effect } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class SpotTableSettingsService {
  private storageService = inject(StorageService);
  public hideZeroBuyCoins: WritableSignal<boolean | null> = signal(null);
  public hideCoinsLessThanOneDollar: WritableSignal<boolean | null> = signal(null);

  constructor() {
    this.loadSettings();
    effect(() => {
      const hideZeroBuyCoins = this.hideZeroBuyCoins();
      if (typeof hideZeroBuyCoins === 'boolean') {
        this.storageService.set('spotTableSettings.hideZeroBuyCoins', hideZeroBuyCoins);
      }
    });
    effect(() => {
      const hideCoinsLessThanOneDollar = this.hideCoinsLessThanOneDollar();
      if (typeof hideCoinsLessThanOneDollar === 'boolean') {
        this.storageService.set(
          'spotTableSettings.hideCoinsLessThanOneDollar',
          hideCoinsLessThanOneDollar
        );
      }
    });
  }

  private async loadSettings() {
    const hideZeroBuyCoins = await this.storageService.get<boolean>(
      'spotTableSettings.hideZeroBuyCoins'
    );
    this.hideZeroBuyCoins.set(typeof hideZeroBuyCoins === 'boolean' ? hideZeroBuyCoins : false);

    const hideCoinsLessThanOneDollar = await this.storageService.get<boolean>(
      'spotTableSettings.hideCoinsLessThanOneDollar'
    );
    this.hideCoinsLessThanOneDollar.set(
      typeof hideCoinsLessThanOneDollar === 'boolean' ? hideCoinsLessThanOneDollar : false
    );
  }
}
