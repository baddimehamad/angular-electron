import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';

import { HomeRoutingModule } from './home/home-routing.module';
import { FirstRoutingModule } from './first/home-routing.module';
import { DetailRoutingModule } from './detail/detail-routing.module';
import { LbonRoutingModule } from './liste_bon/detail-routing.module';;
import { UpdatevignetteRoutingModule } from './update_vignette/home-routing.module';
import { LfactureModule } from './liste_facture/detail.module';
import { LuserModule } from './liste_utilisateur/detail.module';
import { LrelevetModule } from './liste_relevet/detail.module';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
  , {
    path: 'first',
    component: FirstRoutingModule
  },
  {
    path: 'liste_bon',
    component: LbonRoutingModule,
  },
  {
    path: 'liste_facture',
    component: LfactureModule,
  },
  {
    path: 'liste_relevet',
    component: LrelevetModule,
  },
  {
    path: 'update_vignette',
    component: UpdatevignetteRoutingModule,
  },
  {
    path: 'liste_utilisateur',
    component: LuserModule,
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
    HomeRoutingModule,
    DetailRoutingModule,
    LbonRoutingModule,
    UpdatevignetteRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
