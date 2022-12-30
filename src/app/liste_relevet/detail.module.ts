import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LrelevetRoutingModule } from './detail-routing.module';

import { LrelevetComponent } from './detail.component';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [LrelevetComponent],
  imports: [CommonModule, SharedModule, LrelevetRoutingModule,ReactiveFormsModule],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class LrelevetModule {}
