import {
  Component,
  inject,
  ViewChild,
  AfterViewInit,
  ElementRef,
  computed,
  signal
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { RefresherCustomEvent, Platform } from '@ionic/angular';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map, shareReplay, filter, take } from 'rxjs/operators';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import * as BIG from 'big.js';

import { SpotService } from 'src/app/services/spot.service';
import { BybitCSVTxsService } from 'src/app/services/bybit-csv-txs.service';
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
export class SpotPage implements AfterViewInit {
  private spotService = inject(SpotService);
  public bybitCSVTxsService = inject(BybitCSVTxsService);
  public bybitAPITxsService = inject(BybitAPITxsService);
  private coinsPriceService = inject(CoinsPriceService);
  private bo = inject(BreakpointObserver);
  private platform: Platform = inject(Platform);
  private coinsPriceServiceState$ = toObservable(this.coinsPriceService.state);
  public spotTableSettingsService = inject(SpotTableSettingsService);

  private apiKey = this.bybitAPITxsService.apiKey();
  private secretKey = this.bybitAPITxsService.secretKey();
  public hasChangesCredentials = signal(false);

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  isHandset$ = this.bo.observe(['(max-width: 767px)']).pipe(
    map(state => state.matches),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  isLoading = computed(() => {
    const spotServiceState = this.spotService.state();
    return !spotServiceState.ready && spotServiceState.loading;
  });

  coins = computed(() => {
    return this.spotService.coins();
  });

  totalSpotProfit = computed(() => {
    const coins = this.spotService.coins();
    return coins.reduce((sum, c) => new Big(sum).plus(c.totalProfit || 0).toNumber(), 0);
  });

  public alertButtons = [
    {
      text: 'Yes, delete',
      role: 'confirm',
      handler: () => {
        this.bybitCSVTxsService.removeAllData();
      }
    },
    {
      text: 'Cancel',
      role: 'cancel'
    }
  ];

  constructor() {
    this.platform.ready().then(() => {
      if (Capacitor.getPlatform() === 'android') {
        StatusBar.setOverlaysWebView({ overlay: false });
      }
    });
  }

  ngAfterViewInit() {
    // this.coinsIconsService.getIcon('BTC').then(/* url => console.log('icon url', url) */);
  }

  refresh(ev: any) {
    this.coinsPriceService.refresh();
    this.coinsPriceServiceState$
      .pipe(
        map(s => s.loading),
        filter(l => l === false),
        take(1)
      )
      .subscribe(() => (ev as RefresherCustomEvent).detail.complete());
  }

  openFilePicker() {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) {
      return;
    }

    await this.bybitCSVTxsService.addTxFiles(files);
    this.fileInput.nativeElement.value = '';
  }

  downloadData() {
    this.bybitAPITxsService.downloadData();
    // this.bybitAPITxsService.downloadMockData();
  }

  changeCredentials(type: 'apiKey' | 'secretKey', target: EventTarget | null) {
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    const value = target.value.trim();

    if (type === 'apiKey') {
      this.apiKey = value;
    } else if (type === 'secretKey') {
      this.secretKey = value;
    }
    this.hasChangesCredentials.set(true);
  }
  updateCredentials() {
    this.bybitAPITxsService.setApiCredentials(this.apiKey, this.secretKey);
    this.hasChangesCredentials.set(false);
  }
}
