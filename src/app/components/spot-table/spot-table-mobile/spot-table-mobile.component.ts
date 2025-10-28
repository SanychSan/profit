import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { IonText } from '@ionic/angular/standalone';

import { CoinInterface } from 'src/app/classes/coin';
import { SpotTable } from '../spot-table';

@Component({
  selector: 'app-spot-table-mobile',
  templateUrl: './spot-table-mobile.component.html',
  styleUrls: ['./spot-table-mobile.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatTableModule, MatSortModule, IonText]
})
export class SpotTableMobileComponent extends SpotTable {
  override displayedColumns = ['currency', 'price', 'profit'];

  constructor() {
    super();

    this.spotSource.sortingDataAccessor = (item: CoinInterface, property: string) => {
      switch (property) {
        case 'currency':
          return item.totalCost ?? 0;
        case 'price':
          return item.marketPrice ?? 0;
        default:
          return (item as any)[property];
      }
    };
  }
}
