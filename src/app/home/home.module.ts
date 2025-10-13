import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

import { HomePage } from './home.page';
import { HomePageRoutingModule } from './home-routing.module';
import { CoinComponentModule } from '../coin/coin.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CoinComponentModule,
    HomePageRoutingModule,
    MatTableModule,
    MatSortModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
