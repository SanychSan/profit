import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewCoinPage } from './view-coin.page';

const routes: Routes = [
  {
    path: '',
    component: ViewCoinPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewCoinPageRoutingModule {}
