import { Component, ViewChild } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';
import { LocalService } from './local.service';
import { Emitters } from './emitters/emitters';
import { Router } from '@angular/router';
import { ThisReceiver } from '@angular/compiler';
import { NotifierService } from 'angular-notifier';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  authenticated: boolean;
  nom: string = "no_name";
  user_id: string = "no_id";
  minutes_timer: string = "00M";
  secondes_timer: string = "00s";
  prenom: string = "no_prename";
  role: boolean = false;
  date_future: any = new Date(this.localStore.getData("expires"));
  isadmincolor: string = "isadmincolor2";
  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    private localStore: LocalService,
    private router: Router
    ,	private notifier: NotifierService
  ) {
    if (this.localStore.exist("jwt")) {
      this.authenticated = true;
      this.nom = this.localStore.getData("nom").toLocaleUpperCase();
      this.prenom = this.localStore.getData("prenom").toLocaleUpperCase();
    } else {
      this.authenticated = false;
    }
    Emitters.authemiter.subscribe((auth: boolean) => {
      this.authenticated = auth;
      this.localStore.saveData("expires", this.addDays(1750).toString());
      //console.log("the auth is : "+auth);
    })
    Emitters.admincolor.subscribe((col: string) => {
      this.isadmincolor = col;
    })
    if (this.localStore.exist('role')) {
      if (this.localStore.getData('role') == '1') {
        this.role = true;
        this.isadmincolor = "isadmincolor1";
      } else {
        this.role = false;
        this.isadmincolor = "isadmincolor";
      }
    }
    Emitters.role.subscribe((role: boolean) => {
      this.role = role;
      console.log("the role is : " + role);
    })
    this.translate.setDefaultLang('en');
    console.log('APP_CONFIG', APP_CONFIG);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
    } else {
      console.log('Run in browser');
    }
  }
  showNotification(type,message): void {
    this.notifier.notify(type, message );
  }
  timer_countdown() {
    if (this.localStore.exist("expires")) {
      let date_now: any = new Date();
      let d:any= new Date(this.localStore.getData("expires"));
      let seconds = Math.floor((d - (date_now)) / 1000);
      let minutes = Math.floor(seconds / 60);
      let hours = Math.floor(minutes / 60);
      let days = Math.floor(hours / 24);

      hours = hours - (days * 24);
      minutes = minutes - (days * 24 * 60) - (hours * 60);
      seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);

      this.minutes_timer = String(minutes) + "M";
      this.secondes_timer = String(seconds) + "s";
      if (minutes == 0 && seconds == 30) {
        this.showNotification("error","Votre session va s'arreter.(30 seconds)");
      }
      if (minutes == 0 && seconds == 20) {
        this.showNotification("error","Votre session va s'arreter.(20 seconds)");
      }
      if (minutes == 0 && seconds == 10) {
        this.showNotification("error","Votre session va s'arreter.(10 seconds)");
      }
      if (minutes == 0 && seconds == 0) {
        this.signout();
      }
    }
  }
  doslide() {
    const toggle = document.getElementById('header-toggle'),
      nav = document.getElementById('nav-bar'),
      bodypd = document.getElementById('body-pd'),
      headerpd = document.getElementById('header')

    // Validate that all variables exist
    if (toggle && nav && bodypd && headerpd) {
      toggle.addEventListener('click', () => {
        // show navbar
        nav.classList.toggle('show')
        // change icon
        //toggle.classList.toggle('bx-x')
        // add padding to body
        bodypd.classList.toggle('body-pd')
        // add padding to header
        headerpd.classList.toggle('body-pd')
      })
    } else {
      console.log("false");
    }
  }
  doslide1() {
    const toggle = document.getElementById('header-toggle1'),
      nav = document.getElementById('nav-bar'),
      bodypd = document.getElementById('body-pd'),
      headerpd = document.getElementById('header')

    // Validate that all variables exist
    if (toggle && nav && bodypd && headerpd) {
      toggle.addEventListener('click', () => {
        // show navbar
        nav.classList.toggle('show')
        // change icon
        //toggle.classList.toggle('bx-x')
        // add padding to body
        bodypd.classList.toggle('body-pd')
        // add padding to header
        headerpd.classList.toggle('body-pd')
      })
    } else {
      console.log("false");
    }
  }
  signout() {
    this.localStore.clearData();
    this.authenticated = false;
    this.role = false;
    this.isadmincolor = "isadmincolor2";
    this.router.navigate(["/home"]);
  }
  ngOnInit(): void {
    if (this.localStore.exist("role")) {
      if (this.localStore.getData('role') == '1') {
        this.role = true;
        this.isadmincolor = "isadmincolor1";
      } else {
        this.role = false;
        this.isadmincolor = "isadmincolor";
      }
    }
    setInterval(() => {
      this.timer_countdown();
    }, 1000)
  }
  addDays(days: number): Date {
    var futureDate = new Date();
    futureDate.setSeconds(futureDate.getSeconds() + days);
    return futureDate;
  }
}
