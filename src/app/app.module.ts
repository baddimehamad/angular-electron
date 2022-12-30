import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { DatePipe } from '@angular/common';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { DataTablesModule } from "angular-datatables";
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { GlobalConstants } from './common/global-constants';
import { HomeModule } from './home/home.module';
import { FirstModule } from './first/home.module';
import { UpdatevignetteModule } from './update_vignette/home.module';
import { DetailModule } from './detail/detail.module';
import { LbonModule } from './liste_bon/detail.module';
import {  LfactureModule} from './liste_facture/detail.module';
import {  LrelevetModule} from './liste_relevet/detail.module';
import {  LuserModule} from './liste_utilisateur/detail.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ToWords } from 'to-words';
import { ToastService, AngularToastifyModule } from 'angular-toastify';
import { NotifierModule, NotifierOptions } from 'angular-notifier';

// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>  new TranslateHttpLoader(http, './assets/i18n/', '.json');
const customNotifierOptions: NotifierOptions = {
  position: {
		horizontal: {
			position: 'right',
			distance: 12
		},
		vertical: {
			position: 'bottom',
			distance: 12,
			gap: 10
		}
	},
  theme: 'material',
  behaviour: {
    autoHide: 5000,
    onClick: 'hide',
    onMouseover: 'pauseAutoHide',
    showDismissButton: true,
    stacking: 4
  },
  animations: {
    enabled: true,
    show: {
      preset: 'slide',
      speed: 300,
      easing: 'ease'
    },
    hide: {
      preset: 'fade',
      speed: 300,
      easing: 'ease',
      offset: 50
    },
    shift: {
      speed: 300,
      easing: 'ease'
    },
    overlap: 150
  }
};
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    FirstModule,
    SharedModule,
    HomeModule,
    LbonModule,
    LfactureModule,
    LuserModule,
    LrelevetModule,
    AngularToastifyModule,
    DataTablesModule,
    UpdatevignetteModule,
    DetailModule,
    NotifierModule.withConfig(customNotifierOptions),
    AppRoutingModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [ToWords,DatePipe,GlobalConstants,ToastService],
  bootstrap: [AppComponent]
})
export class AppModule {}
