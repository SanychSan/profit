import {
  ChangeDetectionStrategy,
  AfterViewInit,
  Component,
  ViewChild,
  EffectRef,
  effect,
  inject,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';

import { SpotService } from 'src/app/services/spot.service';
import { Coin } from 'src/app/types/coin.type';

@Component({
  selector: 'app-spot-table-desktop',
  templateUrl: './spot-table-desktop.component.html',
  styleUrls: ['./spot-table-desktop.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatTableModule, MatSortModule]
})
export class SpotTableDesktopComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;

  private destroyRef: EffectRef;
  private spotService = inject(SpotService);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns = ['currency', 'equity', 'price', 'profit', 'totalProfit'];
  spotSource = new MatTableDataSource<Coin>();

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
      console.log('SpotPage coins', coins);
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
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit() {
    this.spotSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.destroyRef.destroy();
  }
}
