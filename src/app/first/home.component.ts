import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalConstants } from '../common/global-constants';
import { ToWords } from 'to-words';
import { Emitters } from '../emitters/emitters';
import { LocalService } from '../local.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import * as JsBarcode from "jsbarcode";
import { NotifierService } from 'angular-notifier';
import { error } from 'console';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class FirstComponent implements OnInit {
  values: string = "";
  num_word: string = "";
  authenticate: boolean;
  isChecked;
  isCheckedName;
  isCheckvalue;
  montant_vignette;
  px2mmFactor: number;
  numtow = new ToWords({
    localeCode: 'fr-FR',
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
    }
  });
  checkoutForm = this.formBuilder.group({
    code_fournisseur: new FormControl({ value: '30', disabled: true }, [Validators.required]),
    matricule: new FormControl('', [Validators.required]),
    fournisseur: new FormControl({ value: 'STE LOCALUB SARL', disabled: true }, [Validators.required]),
    code_station: new FormControl('', [Validators.required]),
    ville: new FormControl('', [Validators.required]),
    pu: new FormControl('', [Validators.required]),
    quantite: new FormControl('', [Validators.required]),
    total_brut: new FormControl({ value: '', disabled: true }, [Validators.required]),
    montant: new FormControl('', [Validators.required]),
    num_to_word: new FormControl({ value: '', disabled: true }, []),
    //design: new FormControl('', [Validators.required]),
    lieu: new FormControl('', [Validators.required]),
    date: new FormControl('', [Validators.required]),
    kilometrage: new FormControl('', [Validators.required]),
    signature: new FormControl({ value: this.localStore.getData("nom")+" "+this.localStore.getData("prenom"), disabled: true }, []),
    code_bon: new FormControl('', []),
  });
  allvilles;
  allstations ;
  validcalc=false;
  nom: string;
  prenom: string;
  constructor(private router: Router, private formBuilder: FormBuilder, private localStore: LocalService, private httpClient: HttpClient,	private notifier: NotifierService) {
    //this.checkoutForm.controls["code_fournisseur"].disable();
    //this.checkoutForm.controls["num_to_word"].disable();
    let d=new Date(localStore.getData("expires"));
    this.nom=this.localStore.getData("nom").toLocaleUpperCase();
    this.prenom=this.localStore.getData("prenom").toLocaleUpperCase();
    let now=new Date();
    if(now>d){
      localStore.clearData();
      Emitters.authemiter.emit(false);
      this.router.navigate(["/home"]);
    }
    this.getvilles().subscribe(vi => {
      this.allvilles=vi;
    });
    this.getstations().subscribe(sta => {
     this.allstations=sta;
    });
  }
  calctotal(){
    if(Number(this.checkoutForm.value.quantite)%1==0){
      this.checkoutForm.get('total_brut').setValue((Number(this.checkoutForm.value.pu)*Number(this.checkoutForm.value.quantite)).toFixed(0));
    }else{
      this.checkoutForm.get('total_brut').setValue((Number(this.checkoutForm.value.pu)*Number(this.checkoutForm.value.quantite)).toFixed(2));
    }
  }
  verifier(){
    if((Number(this.checkoutForm.get('montant').value)-Number(this.checkoutForm.get('total_brut').value))>=5 && (Number(this.checkoutForm.get('montant').value)-Number(this.checkoutForm.get('total_brut').value))>=0){
      this.validcalc=false;
      //console.log( Number(this.checkoutForm.get('montant').value)-Number(this.checkoutForm.get('total_brut').value));

    }else{
      this.validcalc=true;
      //console.log( Number(this.checkoutForm.get('montant').value)-Number(this.checkoutForm.get('total_brut').value));
    }
  }
  sendvignette(vignette: vignette): Observable<vignette> {
    return this.httpClient.post<vignette>('http://164.68.124.58:3000/vignette', vignette, {
      headers: new HttpHeaders(
        {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.localStore.getData("jwt"),
          'Accept': '*/*',
        })
    })
      .pipe(
        catchError(this.handleError)
      );
  }
  getvilles(): Observable<ville> {
    return this.httpClient.get<ville>('http://164.68.124.58:3000/vignette/all/ville', {
      headers: new HttpHeaders(
        {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.localStore.getData("jwt"),
          'Accept': '*/*',
        })
    })
      .pipe(
        catchError(this.handleError)
      );
  }
  getstations(): Observable<station> {
    return this.httpClient.get<station>('http://164.68.124.58:3000/vignette/all/station', {
      headers: new HttpHeaders(
        {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.localStore.getData("jwt"),
          'Accept': '*/*',
        })
    })
      .pipe(
        catchError(this.handleError)
      );
  }
  ngOnInit(): void {
    console.log('FirstComponent INIT');
    console.log(GlobalConstants.siteTitle);
    if (!this.localStore.exist("jwt")) {
      this.router.navigate(["/home"]);
    }
    this.px2mmFactor = this.calcPx2MmFactor();
    let data: string = '0000';

    JsBarcode('#barcode', data, {
      format: 'code128', // default
      height: 10 * this.px2mmFactor, // 10mm
      width: 2.3,
      displayValue: false,
      text: '# ' + data + ' #',
      background: 'transparent',
      font: 'monospace',
      fontOptions: 'bold',
      fontSize: 16,
      lineColor: 'darkblue',
      margin: 5 * this.px2mmFactor, // 5mm
      textMargin: 2 * this.px2mmFactor, // 2mm
      // textAlign: 'right',
      // textPosition: 'top',
    });
  }
  private calcPx2MmFactor() {
    let e = document.createElement('div');
    e.style.position = 'absolute';
    e.style.width = '100mm';
    document.body.appendChild(e);
    let rect = e.getBoundingClientRect();
    document.body.removeChild(e);
    return rect.width / 100;
  }
  converttoletters(e) {
    const y = this.checkoutForm.value.montant;
    if (y == null || y == undefined || y == "") {
      this.num_word = "";
    } else {
      this.num_word = this.numtow.convert(y);
    }

  }
  onChange(e) {
    this.isChecked = !this.isChecked;
    this.isCheckedName = e.target.name;
    this.isCheckvalue = e.target.value;
  }
  onchange_code_bon(e) {
    let data = "0000";
    if (e.target.value == "") {
      data = "0000";
    } else {
      data = e.target.value;
    }
    JsBarcode('#barcode', data, {
      format: 'code128', // default
      height: 10 * this.px2mmFactor, // 10mm
      width: 2.3,
      displayValue: false,
      text: '# ' + data + ' #',
      background: 'transparent',
      font: 'monospace',
      fontOptions: 'bold',
      fontSize: 16,
      lineColor: 'darkblue',
      margin: 5 * this.px2mmFactor, // 5mm
      textMargin: 2 * this.px2mmFactor, // 2mm
      // textAlign: 'right',
      // textPosition: 'top',
    });

  }
   showNotification(type,message): void {
    this.notifier.notify(type, message );
  }
  savedata() {
    if(Number.isInteger((this.checkoutForm.value.montant))){
      this.montant_vignette=(Number(this.checkoutForm.value.montant).toFixed(0)).toString();
    }else{
      this.montant_vignette=(Number(this.checkoutForm.value.montant).toFixed(2)).toString();
    }
    let vi: vignette = {
      bon_fact: "0",
      refefact: "",
      mois_bon: String(Number(new Date(this.checkoutForm.value.date).getMonth())+1),
      annee_bon: String(new Date(this.checkoutForm.value.date).getFullYear()),
      date_bon: String(new Date(this.checkoutForm.value.date).getDate().toString().padStart(2, "0")) + String((Number(new Date(this.checkoutForm.value.date).getMonth())+1).toString().padStart(2, "0")) + String(new Date(this.checkoutForm.value.date).getFullYear().toString().padStart(4, "0")),
      numeimma: this.checkoutForm.value.matricule.toString().toUpperCase(),
      codalfbo: this.checkoutForm.value.code_bon.toString().substring(0,2).toUpperCase(),
      nume_bon: this.checkoutForm.value.code_bon.toString().substring(2,8),
      numeprod: this.isCheckvalue,
      quantite: Number(this.checkoutForm.value.quantite).toString(),
      prixunit: Number(this.checkoutForm.value.pu).toFixed(2),
      montvign: this.montant_vignette,
      kilometr: this.checkoutForm.value.kilometrage,
      code_sta: this.checkoutForm.value.code_station.id,
      total_brut: this.checkoutForm.get("total_brut").value,
      code_for: this.checkoutForm.get("code_fournisseur").value,
      ville: this.checkoutForm.value.ville.id,
      user_id: this.localStore.getData("id"),
      lieu: this.checkoutForm.value.lieu
    }
    this.sendvignette(vi).subscribe(hero => {
      //console.log(hero);
      this.showNotification("success","VIGNETTE AJOUTER AVEC SUCCESS.");
    },err=>{
      this.showNotification("error","VIGNETTE N'EST PAS AJOUTER.");
    });
    this.checkoutForm.reset();
    setTimeout(() => {
      this.router.navigate(["/liste_bon"]);
    }, 1000);
  }
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.status === 401) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = 'An error occurred:' + error.message;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      errorMessage = `Backend returned code ${error.status}, body was: ` + error.message;
    }
    // Return an observable with a user-facing error message.
    return throwError(() => {
      return errorMessage;
    });
  }

   maxLengthCheck(object) {
    if (object.target.value.length > object.target.maxLength){
      if (object.target.value.length > object.target.max.length)
      object.target.value = object.target.value.slice(0, object.target.max.length)
    }
  }

   isNumeric (evt) {
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode (key);
    var regex = /[0-9]|\./;
    if ( !regex.test(key) ) {
      theEvent.returnValue = false;
      if(theEvent.preventDefault) theEvent.preventDefault();
    }
  }
}

export class station {
  constructor(public id: string, public Name_station: string) {
  }
}
export class ville {
  constructor(public id: string, public Name_ville: string) {
  }
}
export interface vignette {
  bon_fact: string;
  refefact: string;
  mois_bon: string;
  annee_bon: string;
  date_bon: string;
  numeimma: string;
  codalfbo: string;
  nume_bon: string;
  numeprod: string;
  quantite: string;
  prixunit: string;
  montvign: string;
  kilometr: string;
  code_sta: string;
  code_for: string;
  total_brut:string;
  ville: string;
  user_id:string;
  lieu:string;
  date_facture?:string;
}
export interface station{
  id:string;
  station:string;
}
export interface ville{
  id:string;
  station:ville;
}

