import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { BybitAPITxsService } from 'src/app/services/bybit-api-txs.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class HomePage {
  private bybitAPITxsService = inject(BybitAPITxsService);

  public hasCredentials = this.bybitAPITxsService.hasCredentials;

}
