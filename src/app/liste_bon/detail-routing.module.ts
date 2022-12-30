import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LbonComponent } from './detail.component';

const routes: Routes = [
  {
    path: 'liste_bon',
    component: LbonComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LbonRoutingModule {}
