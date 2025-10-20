import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

import { Coin } from 'src/app/types/coin.type';
import { SpotTable } from '../spot-table';

@Component({
  selector: 'app-spot-table-mobile',
  templateUrl: './spot-table-mobile.component.html',
  styleUrls: ['./spot-table-mobile.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatTableModule, MatSortModule]
})
export class SpotTableMobileComponent extends SpotTable {
  override displayedColumns = ['currency', 'price', 'profit'];

  constructor() {
    super();

    this.spotSource.sortingDataAccessor = (item: Coin, property: string) => {
      switch (property) {
        case 'currency':
          return item.totalValue ?? 0;
        case 'price':
          return item.curPrice ?? 0;
        default:
          return (item as any)[property];
      }
    };
  }
}
