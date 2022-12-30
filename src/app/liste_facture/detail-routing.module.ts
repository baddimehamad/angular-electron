import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LfactureComponent } from './detail.component';

const routes: Routes = [
  {
    path: 'liste_facture',
    component: LfactureComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LfactureRoutingModule {}
