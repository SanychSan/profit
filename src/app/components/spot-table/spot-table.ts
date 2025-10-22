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

import { SpotTableSettingsService } from 'src/app/services/spot-table-settings.service';
import { SpotService } from 'src/app/services/spot.service';
import { CoinInterface } from 'src/app/classes/coin';

@Directive()
export abstract class SpotTable implements AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;

  private destroyRef: EffectRef;
  private cdr = inject(ChangeDetectorRef);
  private spotService = inject(SpotService);
  public spotTableSettingsService = inject(SpotTableSettingsService);

  displayedColumns: string[] = [];
  spotSource = new MatTableDataSource<CoinInterface>();

  constructor() {
    this.destroyRef = effect(() => {
      this.spotSource.data = this.spotService
        .coins()
        .filter(c => {
          if (this.spotTableSettingsService.hideZeroBuyCoins()) {
            return c.avgBuyPrice > 0;
          }
          return true;
        })
        .filter(c => {
          if (this.spotTableSettingsService.hideCoinsLessThanOneDollar()) {
            return c.totalInvested > 1;
          }
          return true;
        });

      console.log('SpotPage coins', this.spotSource.data);
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
