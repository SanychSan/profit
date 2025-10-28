import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

import { SpotPage } from './spot.page';
import { SpotPageRoutingModule } from './spot-routing.module';
import { SpotTableDesktopComponent } from 'src/app/components/spot-table/spot-table-desktop/spot-table-desktop.component';
import { SpotTableMobileComponent } from 'src/app/components/spot-table/spot-table-mobile/spot-table-mobile.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SpotTableDesktopComponent,
    SpotTableMobileComponent,
    SpotPageRoutingModule,
    MatTableModule,
    MatSortModule,
    RouterModule
  ],
  declarations: [SpotPage]
})
export class SpotPageModule {}
