import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { GlobalConstants } from '../common/global-constants';
import { catchError, Observable, throwError } from 'rxjs';
import { LocalService } from '../local.service';
import { Emitters } from '../emitters/emitters';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import * as Excel from 'exceljs/dist/exceljs';
import {ExcelService} from '../excel.service';
import { Importer } from 'xlsx-import/lib/Importer';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import { Workbook } from 'exceljs';
declare var $;

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class LuserComponent implements OnInit {
  title = 'angular-app';
  total_vignette:number=0;
  total_brut:number=0;
  total_remise:number=0;
  total_net:number=0;
  invoice: any | null = null;
  fileName= 'ExcelSheet.xlsx';
  allusers: any = [];
  role_selected=1;
  ckecked_bons: Array<string> = [];
  auth: boolean;
  displayStyle = "none";
  displayStyle1 = "none";
  displayStyle2 = "none";
  authenticated: boolean;
  deletenone: string;
  id_user: number;
  user_nom: string;
  user_prenom: string;
  checkboxes_diabled: boolean = false;
  isChecked;
  isCheckedName;
  isCheckvalue;
  id: string = this.localStore.getData("updatevignetteid");
  modal_var: string = "animate__backInDown";
  modal_opened: string = "";
  userList = [];
  allroles = [
    new role('1', 'Administrateur'),
    new role('2', 'Utilisateur')
  ]
  allactives = [
    new active('1', 'Acitve'),
    new active('2', 'Not active')
  ]
  userupdate:utilisateur;
  constructor(private router: Router, private formBuilder: FormBuilder, private httpClient: HttpClient, private localStore: LocalService, private glob: GlobalConstants, private excel: ExcelService) {
    let d = new Date(localStore.getData("expires"));
    let now = new Date();
    if (now > d) {
      localStore.clearData();
      Emitters.authemiter.emit(false);
      this.router.navigate(["/home"]);
    }
    console.log(this.localStore.getData('role'));

  }
  checkoutFormadd = this.formBuilder.group({
    nom: new FormControl('', [Validators.required]),
    prenom: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    role: new FormControl('2', [Validators.required]),
    active: new FormControl('', [Validators.required]),
    pseudo: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });
  checkoutFormupdate = this.formBuilder.group({
    nom: new FormControl('', [Validators.required]),
    prenom: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    role: new FormControl('2', [Validators.required]),
    active: new FormControl('', [Validators.required]),
    pseudo: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });
  private onDownloadInvoice(): Promise<Blob> {
    return fetch('../../assets/f1.xlsx').then((r) => r.blob());
}

async onUpload(): Promise<void> {
  const invoiceFile = await this.onDownloadInvoice();
  const reader = new FileReader();
  reader.readAsArrayBuffer(invoiceFile);
  reader.addEventListener('loadend', async () => {
      if (reader.result instanceof ArrayBuffer) {
          const wb = new Workbook();
          await wb.xlsx.load(reader.result);
          wb.xlsx.load(reader.result)
          .then(function () {
            const worksheet = wb.getWorksheet(1);
            //console.log('rowCount: ', worksheet.rowCount);
            worksheet.getCell('H14').value = 145;
            /*worksheet.eachRow(function (row, rowNumber) {
              worksheet.getCell('A1').value = 'update file';
            });*/
            wb.xlsx.writeBuffer().then((data) => {
              let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
              const url = window.URL.createObjectURL(blob);
              //console.log(url);
              fetch(url)
                .then(response => response.blob())
                .then(blob => {
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = "txt.xlsx";
                  link.click();
                })
                .catch(console.error);
            })
          });
      }
  });
}
  readExcel(event) {
    const workbook = new Excel.Workbook();
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }

    /**
     * Final Solution For Importing the Excel FILE
     */

    console.log(target.files[0]);

    const arryBuffer = new Response(target.files[0]).arrayBuffer();
    console.log(arryBuffer);
    arryBuffer.then(function (data) {
      workbook.xlsx.load(data)
        .then(function () {

          // play with workbook and worksheet now
          console.log(workbook);
          const sheet = workbook.addWorksheet('My Sheet');
          const worksheet = workbook.getWorksheet(1);
          console.log('rowCount: ', worksheet.rowCount);

          worksheet.eachRow(function (row, rowNumber) {
            console.log('Row: ' + rowNumber + ' Value: ' + row.values);
            worksheet.getCell('A1').value = '5';
          });
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            //const blob = new Blob([data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            console.log(url);
            fetch(url)
              .then(response => response.blob())
              .then(blob => {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "txt.xlsx";
                link.click();
              })
              .catch(console.error);
          })
        });
    });
  }
  openPopup(id,nom,prenom) {
    this.id_user = id;
    this.user_nom = nom;
    this.user_prenom = prenom;
    this.displayStyle = "block";
    this.modal_var = "animate__backInDown";
    this.deletenone = "animate__bounce animate__delay-1s";
  }
  closePopup() {
    this.displayStyle = "none";
    this.modal_var = "animate__backOutDown";
    this.deletenone = "";
  }
  openPopup_update(id) {
    this.id_user = id;
    this.getoneuser(id).subscribe((utilisateur: any) => {
      this.userupdate=utilisateur;
      this.checkoutFormupdate.get('nom').setValue(this.userupdate[0].nom);
      this.checkoutFormupdate.get('prenom').setValue(this.userupdate[0].prenom);
      this.checkoutFormupdate.get('email').setValue(this.userupdate[0].email);
      this.checkoutFormupdate.get('role').setValue(this.userupdate[0].role);
      this.checkoutFormupdate.get('active').setValue(this.userupdate[0].active);
      this.checkoutFormupdate.get('pseudo').setValue(this.userupdate[0].pseudo);
      this.checkoutFormupdate.get('password').setValue(this.userupdate[0].password);
      console.log(this.userupdate[0].role);
    });
    this.displayStyle1 = "block";
    this.modal_var = "animate__backInDown";
    this.deletenone = "animate__bounce animate__delay-1s";
  }
  closePopup_update() {
    this.displayStyle1 = "none";
    this.modal_var = "animate__backOutDown";
    this.deletenone = "";
  }

  /*writeFile(path, contents, cb) {
   fs.mkdir(dirname(path), { recursive: true}, function (err) {
     if (err) return cb(err);

     fs.writeFile(path, contents, cb);
   });
 }*/
  onChange(e) {
    while (this.ckecked_bons.length) { this.ckecked_bons.pop(); }
    document.querySelectorAll('input[type="checkbox"]:checked').forEach((el: any) => {

      this.ckecked_bons.push(el.value)
      //console.log(el);

    })
    console.log(this.ckecked_bons);

    if (this.ckecked_bons.length < 2) {
      document.querySelectorAll('input[type="checkbox"]').forEach((ele: any) => {
        if (!this.ckecked_bons.includes(ele.value)) {
          ele.disabled = false;
        }
      })
    } else {
      document.querySelectorAll('input[type="checkbox"]').forEach((ele: any) => {
        if (!this.ckecked_bons.includes(ele.value)) {
          ele.disabled = true;
        }
      })
    }
    /*this.isChecked = !this.isChecked;
    this.isCheckedName = e.target.name;
    this.isCheckvalue = e.target.value;*/
  }
  chooseFile(name) {
    var chooser = document.querySelector(name);
    chooser.addEventListener("change", function (evt) {
      console.log(this.value);
    }, false);

    chooser.click();
  }
  opendiag() {
    this.chooseFile('#fileDialog');
  }
  downloadObjectAsJson(txtname,txtdata) {
    /*let exportname = "test";
    let exportdata = "this is \n test file";*/
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(txtdata);
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", txtname + ".txt");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
  downloadFile(data: string) {
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  }
  getallusers(): Observable<utilisateur> {
    return this.httpClient.get<utilisateur>('http://164.68.124.58:3000/utilisateur/', {
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
  getoneuser(id): Observable<utilisateur> {
    return this.httpClient.get<utilisateur>('http://164.68.124.58:3000/utilisateur/'+id, {
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
  deletevignette(id: number): Observable<utilisateur> {
    return this.httpClient.delete<utilisateur>('http://164.68.124.58:3000/vignette/' + id, {
      headers: new HttpHeaders(
        {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'DELETE',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.localStore.getData("jwt"),
          'Accept': '*/*',
        })
    })
      .pipe(
        catchError(this.handleError)
      );
  }
  facture(data_to_send: Array<string>): Observable<any> {
    return this.httpClient.post<any>('http://164.68.124.58:3000/vignette/facture/', data_to_send, {
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
  deletevignette_button() {
    this.deletevignette(this.id_user).subscribe((bon: any) => {
      //console.log(bon);
    });
    this.closePopup();
    this.getallusers().subscribe((users: any) => {
      this.allusers = users;
    });
  }
  facturee() {
    /*var ckecked_bons_send: Array<string> = [];
    this.ckecked_bons.forEach(element => {
      ckecked_bons_send.push(element);
    });
    ckecked_bons_send.push(this.checkoutForm.value.nume_facture, this.checkoutForm.value.date_facture);
    console.log(ckecked_bons_send);

    this.facture(ckecked_bons_send).subscribe((bon: any) => {
      console.log(bon);
    });
    this.checkoutForm.reset();
    this.closePopup_update();
    if(this.localStore.getData("role")=="1"){
      this.router.navigate(['/liste_facture']);
    }else{
      this.router.navigate(['/liste_bon'])
    }*/
  }
  openPopup_utilisateur() {
    this.displayStyle2 = "block";
    this.modal_var = "animate__backInDown";
    this.deletenone = "animate__bounce animate__delay-1s";
  }
  closePopup_utilisateur() {
    this.displayStyle2 = "none";
    this.modal_var = "animate__backOutDown";
    this.deletenone = "";
  }
  updateuser(id: number) {
    this.localStore.saveData("updatevignetteid", id.toString());
    this.router.navigateByUrl("/update_vignette");
  }
  cree_utilisateur(){}
  ngOnInit(): void {
    this.getallusers().subscribe((users: any) => {
      this.allusers = users;
    });
    setTimeout(() => {
      $('#datatableexample').DataTable({
        "language": {
          "lengthMenu": "Affichage _MENU_ Bon par page",
          "zeroRecords": "rien a été touvé !",
          "info": "Afficahge page _PAGE_ par _PAGES_",
          "infoEmpty": "Pas de bon",
          "infoFiltered": "(Filtrer depuis _MAX_ jusqu'a records)",
          "search": "Recherche:",
          "paginate": {
            "first": "Premier",
            "last": "Fin",
            "next": "Suivant",
            "previous": "Précédent"
          }
        },
        pagingType: 'full_numbers',
        pageLength: 5,
        processing: true,
        "lengthMenu": [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]]
      });
    }, 500);
  }
  updatetable(){
    setTimeout(() => {
      $('#datatableexample').DataTable({
        "language": {
          "lengthMenu": "Affichage _MENU_ Bon par page",
          "zeroRecords": "rien a été touvé !",
          "info": "Afficahge page _PAGE_ par _PAGES_",
          "infoEmpty": "Pas de bon",
          "infoFiltered": "(Filtrer depuis _MAX_ jusqu'a records)",
          "search": "Recherche:",
          "paginate": {
            "first": "Premier",
            "last": "Fin",
            "next": "Suivant",
            "previous": "Précédent"
          }
        },
        pagingType: 'full_numbers',
        pageLength: 5,
        processing: true,
        "lengthMenu": [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]]
      });
    }, 500);
  }
}
export class role {
  constructor(public id: string, public nom_role: string) {
  }
}
export class active {
  constructor(public id: string, public nom_active: string) {
  }
}
export interface utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  active: string;
  username: string;
  password: string;
}
export interface bon{
  numero:number,
  date:string,
  lieu:string,
  matricule:string,
  designation:string,
  pu:string,
  mnt_v:string,
  mnt_b:string,
  remise:string,
  mnt_n:string
}
