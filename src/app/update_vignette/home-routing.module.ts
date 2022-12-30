import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { UpdatevignetteComponent } from './home.component';

const routes: Routes = [
  {
    path: 'update_vignette',
    component: UpdatevignetteComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UpdatevignetteRoutingModule {}
