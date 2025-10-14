import {
  Component,
  inject,
  ViewChild,
  effect,
  AfterViewInit,
  OnDestroy,
  EffectRef
} from '@angular/core';
import { RefresherCustomEvent } from '@ionic/angular';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import { SpotService } from 'src/app/services/spot.service';
import { Coin } from 'src/app/types/coin.type';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage implements AfterViewInit, OnDestroy {
  private spotService = inject(SpotService);
  private destroyRef: EffectRef;

  displayedColumns = ['name', 'qty', 'buyPrice', 'lastBuyProfit', 'generalProfit'];

  spotSource = new MatTableDataSource<Coin>([]);

  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    this.destroyRef = effect(() => {
      const coins = this.spotService.coins();
      console.log('HomePage coins', coins);
      this.spotSource.data = coins.map(
        c =>
          ({
            name: c.id,
            qty: c.qty,
            buyPrice: c.avgPrice,
            curPrice: c.marketPrice,
            profit: c.profit,
            lastProfit: c.lastProfit
          } as Coin)
      );
    });
  }

  ngAfterViewInit() {
    this.spotSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroyRef.destroy();
  }

  refresh(ev: any) {
    setTimeout(() => {
      (ev as RefresherCustomEvent).detail.complete();
    }, 3000);
  }
}
