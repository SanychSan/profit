import { Component, inject, ViewChild, effect, DestroyRef } from '@angular/core';
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
export class HomePage {
  private spotService = inject(SpotService);
  private destroyRef = inject(DestroyRef);

  displayedColumns = ['feeCoin', 'profit', 'filledValue', 'avgFilledPrice', 'timestamp'];
  spotSource = new MatTableDataSource<Coin>([]);

  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    effect(
      () => {
        this.spotSource.data = this.spotService.coins();
      },
      { injector: this.destroyRef as any }
    );
  }

  ngAfterViewInit() {
    this.spotSource.sort = this.sort;
  }

  refresh(ev: any) {
    setTimeout(() => {
      (ev as RefresherCustomEvent).detail.complete();
    }, 3000);
  }
}
