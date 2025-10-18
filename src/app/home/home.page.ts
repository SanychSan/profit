import {
  Component,
  inject,
  ViewChild,
  effect,
  AfterViewInit,
  OnDestroy,
  EffectRef,
  ElementRef,
  computed
} from '@angular/core';
import { RefresherCustomEvent } from '@ionic/angular';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Papa } from 'ngx-papaparse';

import { SpotService } from 'src/app/services/spot.service';
import { TransactionsService } from 'src/app/services/transactions.service';
import { CoinsIconsService } from 'src/app/services/coins-icons.service';
import { Coin } from 'src/app/types/coin.type';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage implements AfterViewInit, OnDestroy {
  private papa = inject(Papa);
  private spotService = inject(SpotService);
  private transactionsService = inject(TransactionsService);
  private coinsIconsService = inject(CoinsIconsService);
  private destroyRef: EffectRef;

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  displayedColumns = ['currency', 'equity', 'profit', 'price', 'totalProfit'];

  spotSource = new MatTableDataSource<Coin>([]);

  @ViewChild(MatSort) sort!: MatSort;

  totalSpotProfit = computed(() => {
    const coins = this.spotService.coins();
    return coins.reduce((sum, c) => sum + (c.totalProfit || 0), 0);
  });

  constructor() {
    this.spotSource.sortingDataAccessor = (item: Coin, property: string) => {
      switch (property) {
        case 'equity':
          return item.totalValue ?? 0;
        case 'price':
          return item.buyPrice ?? 0;
        case 'totalProfit':
          return item.totalProfit ?? 0;
        default:
          return (item as any)[property];
      }
    };
    this.destroyRef = effect(() => {
      const coins = this.spotService.coins();
      console.log('HomePage coins', coins);
      this.spotSource.data = coins.map(
        c =>
          ({
            name: c.id,
            totalCoins: c.totalCoins,
            totalValue: c.totalCoins * c.marketPrice,
            buyPrice: c.avgPrice,
            curPrice: c.marketPrice,
            profit: c.profit,
            prcProfit:
              c.totalCoins && c.avgPrice ? ((c.marketPrice - c.avgPrice) / c.avgPrice) * 100 : 0,
            totalProfit: c.totalProfit
          } as Coin)
      );
    });
  }

  ngAfterViewInit() {
    this.spotSource.sort = this.sort;
    this.coinsIconsService.getIcon('BTC').then(/* url => console.log('icon url', url) */);
  }

  ngOnDestroy(): void {
    this.destroyRef.destroy();
  }

  refresh(ev: any) {
    setTimeout(() => {
      (ev as RefresherCustomEvent).detail.complete();
    }, 3000);
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
      error: err => console.error('Parse error:', err)
    });
  }
}
