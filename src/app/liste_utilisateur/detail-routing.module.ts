import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LuserComponent } from './detail.component';

const routes: Routes = [
  {
    path: 'liste_utilisateur',
    component: LuserComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LuserRoutingModule {}
