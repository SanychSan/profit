import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'spot',
    loadChildren: () => import('./pages/spot/spot.module').then(m => m.SpotPageModule)
  },
  {
    path: 'coin/:id',
    loadChildren: () => import('./pages/view-coin/view-coin.module').then(m => m.ViewCoinPageModule)
  },
  {
    path: '',
    redirectTo: 'spot',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
