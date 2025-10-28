import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // {
  //   path: '',
  //   loadComponent: () => import('src/app/pages/home/home.page').then(m => m.HomePage)
  // },
  {
    path: '',
    loadChildren: () => import('src/app/pages/spot/spot.module').then(m => m.SpotPageModule)
  },
  {
    path: 'credentials',
    loadComponent: () => import('src/app/pages/credentials/credentials.page').then(m => m.CredentialsPage)
  },
  // {
  //   path: 'coin/:id',
  //   loadChildren: () => import('./pages/view-coin/view-coin.module').then(m => m.ViewCoinPageModule)
  // },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
