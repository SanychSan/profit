import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

import { CoinInterface } from 'src/app/classes/coin';
import { SpotTable } from '../spot-table';

@Component({
  selector: 'app-spot-table-desktop',
  templateUrl: './spot-table-desktop.component.html',
  styleUrls: ['./spot-table-desktop.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatTableModule, MatSortModule]
})
export class SpotTableDesktopComponent extends SpotTable {
  override displayedColumns = ['currency', 'equity', 'price', 'profit', 'totalProfit'];

  constructor() {
    super();
    this.spotSource.sortingDataAccessor = (item: CoinInterface, property: string) => {
      switch (property) {
        case 'equity':
          return item.totalCost ?? 0;
        case 'price':
          return item.avgBuyPrice ?? 0;
        case 'totalProfit':
          return item.totalProfit ?? 0;
        default:
          return (item as any)[property];
      }
    };
  }
}
