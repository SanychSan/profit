import { Component, inject, ViewChild, AfterViewInit, ElementRef, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { RefresherCustomEvent, Platform } from '@ionic/angular';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map, shareReplay, filter, take } from 'rxjs/operators';
import { Papa } from 'ngx-papaparse';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

import { SpotService } from 'src/app/services/spot.service';
import { TransactionsService } from 'src/app/services/transactions.service';
import { CoinsPriceService } from 'src/app/services/coins-price.service';
import { SpotTableSettingsService } from 'src/app/services/spot-table-settings.service';
import * as BIG from 'big.js';

const { Big } = BIG;

@Component({
  selector: 'app-spot',
  templateUrl: 'spot.page.html',
  styleUrls: ['spot.page.scss'],
  standalone: false
})
export class SpotPage implements AfterViewInit {
  private papa = inject(Papa);
  private spotService = inject(SpotService);
  private transactionsService = inject(TransactionsService);
  private coinsPriceService = inject(CoinsPriceService);
  private bo = inject(BreakpointObserver);
  private platform: Platform = inject(Platform);
  private coinsPriceServiceState$ = toObservable(this.coinsPriceService.state);
  public spotTableSettingsService = inject(SpotTableSettingsService);

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
        this.transactionsService.removeAllData();
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

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: result => {
        this.transactionsService.addTransactions(result.data);
        this.fileInput.nativeElement.value = '';
      },
      error: err => {
        console.error('Parse error:', err);
        this.fileInput.nativeElement.value = '';
      }
    });
  }
}
