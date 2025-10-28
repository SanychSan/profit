import { Component, inject, computed } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import * as BIG from 'big.js';

import { SpotApiService } from 'src/app/services/spot-api.service';
import { CoinsPriceService } from 'src/app/services/coins-price.service';
import { SpotTableSettingsService } from 'src/app/services/spot-table-settings.service';
import { BybitAPITxsService } from 'src/app/services/bybit-api-txs.service';

const { Big } = BIG;

@Component({
  selector: 'app-spot',
  templateUrl: 'spot.page.html',
  styleUrls: ['spot.page.scss'],
  standalone: false
})
export class SpotPage {
  private spotService = inject(SpotApiService);
  public bybitAPITxsService = inject(BybitAPITxsService);
  private coinsPriceService = inject(CoinsPriceService);
  private bo = inject(BreakpointObserver);
  private platform: Platform = inject(Platform);
  public spotTableSettingsService = inject(SpotTableSettingsService);

  public hasCredentials = this.bybitAPITxsService.hasCredentials;

  isHandset$ = this.bo.observe(['(max-width: 767px)']).pipe(
    map(state => state.matches),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  coins = this.spotService.coins;

  isLoading = computed(() => {
    const spotServiceState = this.spotService.state();
    const coinsPriceServiceState = this.coinsPriceService.state();
    return spotServiceState.loading || coinsPriceServiceState.loading;
  });

  totalSpotProfit = computed(() => {
    const coins = this.spotService.coins();
    return coins.reduce((sum, c) => new Big(sum).plus(c.totalProfit || 0).toNumber(), 0);
  });

  constructor() {
    this.platform.ready().then(() => {
      if (Capacitor.getPlatform() === 'android') {
        StatusBar.setOverlaysWebView({ overlay: false });
      }
    });
  }

  syncData() {
    if (this.bybitAPITxsService.isLoading()) {
      return;
    }
    this.bybitAPITxsService.syncData();
  }
}
