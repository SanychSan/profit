import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

import { SpotPage } from './spot.page';
import { SpotPageRoutingModule } from './spot-routing.module';
// import { CoinComponentModule } from 'src/app/components/coin/coin.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // CoinComponentModule,
    SpotPageRoutingModule,
    MatTableModule,
    MatSortModule
  ],
  declarations: [SpotPage]
})
export class SpotPageModule {}
