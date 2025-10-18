import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewCoinPage } from './view-coin.page';

import { IonicModule } from '@ionic/angular';

import { ViewCoinPageRoutingModule } from './view-coin-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewCoinPageRoutingModule
  ],
  declarations: [ViewCoinPage]
})
export class ViewCoinPageModule {}
