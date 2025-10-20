import {
  AfterViewInit,
  ViewChild,
  EffectRef,
  effect,
  inject,
  ChangeDetectorRef,
  OnDestroy,
  Directive
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import * as BIG from 'big.js';

import { SpotTableSettingsService } from 'src/app/services/spot-table-settings.service';
import { SpotService } from 'src/app/services/spot.service';
import { Coin } from 'src/app/types/coin.type';

const { Big } = BIG;

@Directive()
export abstract class SpotTable implements AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;

  private destroyRef: EffectRef;
  private cdr = inject(ChangeDetectorRef);
  private spotService = inject(SpotService);
  private spotTableSettingsService = inject(SpotTableSettingsService);

  displayedColumns: string[] = [];
  spotSource = new MatTableDataSource<Coin>();

  constructor() {
    this.destroyRef = effect(() => {
      const coins = this.spotService
        .coins()
        .filter(c => {
          if (this.spotTableSettingsService.hideZeroBuyCoins()) {
            return c.avgPrice > 0;
          }
          return true;
        })
        .filter(c => {
          if (this.spotTableSettingsService.hideCoinsLessThanOneDollar()) {
            return new Big(c.totalCoins).times(c.marketPrice).toNumber() > 1;
          }
          return true;
        });
      // console.log('SpotPage coins', coins);
      this.spotSource.data = coins.map(
        c =>
          ({
            name: c.id,
            totalCoins: c.totalCoins,
            totalValue: new Big(c.totalCoins).times(c.marketPrice).toNumber(),
            buyPrice: c.avgPrice,
            curPrice: c.marketPrice,
            profit: c.profit,
            prcProfit:
              c.totalCoins && c.avgPrice
                ? new Big(c.marketPrice).minus(c.avgPrice).div(c.avgPrice).times(100).toNumber()
                : 0,
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
