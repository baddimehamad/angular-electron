import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LrelevetComponent } from './detail.component';

const routes: Routes = [
  {
    path: 'liste_relevet',
    component: LrelevetComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LrelevetRoutingModule {}
