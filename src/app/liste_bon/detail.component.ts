import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { GlobalConstants } from '../common/global-constants';
import { catchError, elementAt, Observable, throwError } from 'rxjs';
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
import { ToastService } from 'angular-toastify';
import { NotifierService } from 'angular-notifier';
declare var $;

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class LbonComponent implements OnInit {
  title = 'angular-app';
  total_vignette:number=0;
  total_brut:number=0;
  total_remise:number=0;
  total_net:number=0;
  invoice: any | null = null;
  fileName= 'ExcelSheet.xlsx';
  allbons: any = [];
  ckecked_bons: Array<string> = [];
  auth: boolean;
  displayStyle = "none";
  displayStyle1 = "none";
  authenticated: boolean;
  deletenone: string;
  id_delete: number;
  checkboxes_diabled: boolean = false;
  isChecked;
  isCheckedName;
  isCheckvalue;
  id: string = this.localStore.getData("updatevignetteid");
  modal_var: string = "animate__backInDown";
  modal_opened: string = "";
  userList = [];

  constructor(private router: Router, private formBuilder: FormBuilder, private httpClient: HttpClient, private localStore: LocalService, private glob: GlobalConstants, private excel: ExcelService,private _toastService: ToastService,	private notifier: NotifierService) {
    let d = new Date(localStore.getData("expires"));
    let now = new Date();
    if (now > d) {
      localStore.clearData();
      Emitters.authemiter.emit(false);
      this.router.navigate(["/home"]);
    }
    //console.log(this.localStore.getData('role'));
  }
  checkoutForm = this.formBuilder.group({
    nume_facture: new FormControl('', [Validators.required]),
    date_facture: new FormControl('', [Validators.required])
  });
  private onDownloadInvoice(): Promise<Blob> {
    return fetch('../../assets/f1.xlsx').then((r) => r.blob());
}
showNotification(type,message): void {
  this.notifier.notify(type, message );
}
 addInfoToast() {
    this._toastService.info('message');
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
            //window.open(url);
            //let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            /*console.log(data);

            var dataStr = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet," + encodeURIComponent(data);
            var downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "text" + ".txt");
            document.body.appendChild(downloadAnchorNode); // required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();*/
            //fs.saveAs(blob, 'CarData.xlsx');
          })
        });
    });
  }
  download(url, filename) {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      })
      .catch(console.error);
  }
  openPopup(id) {
    this.id_delete = id;
    this.displayStyle = "block";
    this.modal_var = "animate__backInDown";
    this.deletenone = "animate__bounce animate__delay-1s";
  }
  closePopup() {
    //this.displayStyle = "none";
    this.modal_var = "animate__backOutDown";
    this.deletenone = "";
  }
  openPopup_facture() {
    this.displayStyle1 = "block";
    this.modal_opened = "modal_opened";
    this.modal_var = "animate__backInDown";
    this.deletenone = "animate__bounce animate__delay-1s";
    this.onChange(' ');
  }
  closePopup_facture() {
    //this.displayStyle = "none";
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

    if (this.ckecked_bons.length < 25) {
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
  sendvignette(): Observable<vignette> {
    return this.httpClient.get<vignette>('http://164.68.124.58:3000/vignette/' + this.localStore.getData("role"), {
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
  deletevignette(id: number): Observable<vignette> {
    return this.httpClient.delete<vignette>('http://164.68.124.58:3000/vignette/' + id, {
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
    this.deletevignette(this.id_delete).subscribe((bon: any) => {
      //console.log(bon);
    });
    this.closePopup();
    this.sendvignette().subscribe((bon: any) => {
      this.allbons = bon;
    });
  }
  facturee() {
    var ckecked_bons_send: Array<string> = [];
    this.ckecked_bons.forEach(element => {
      ckecked_bons_send.push(element);
    });
    ckecked_bons_send.push(this.checkoutForm.value.nume_facture, this.checkoutForm.value.date_facture);
    console.log(ckecked_bons_send);

    this.facture(ckecked_bons_send).subscribe((bon: any) => {
      //console.log(bon);
      this.showNotification("success","Facture AJOUTER AVEC SUCCESS.");
    },err=>{
      this.showNotification("error","Facture N'EST PAS AJOUTER.");
    });
    setTimeout(() => {
      this.router.navigate(['/liste_facture']);
    }, 1500);
    this.checkoutForm.reset();
    this.closePopup_facture();
    if(this.localStore.getData("role")=="1"){
      setTimeout(() => {
        this.router.navigate(['/liste_facture']);
      }, 2000);
    }else{
      setTimeout(() => {
        this.router.navigate(['/liste_bon']);
      }, 2000);
    }
  }
  updatevignette(id: number) {
    this.localStore.saveData("updatevignetteid", id.toString());
    this.router.navigateByUrl("/update_vignette");
  }
  ngOnInit(): void {
    this.sendvignette().subscribe((bon: any) => {
      this.allbons = bon;
      bon.forEach(ele => {
        if(ele.numeprod!='110' && ele.numeprod!='120' && ele.numeprod!='140' && ele.numeprod!='160' && ele.numeprod!='190'){
          ele.numeprod="N.T.";
          ele.is_numprod_valid=false;
        }else{
          ele.is_numprod_valid=true;
        }
      });
console.log(this.allbons);

    });
    setTimeout(() => {
      $('#datatableexample').DataTable({
        "language": {
          "lengthMenu": "Affichage _MENU_ Bon par page",
          "zeroRecords": "rien a été touvé !",
          "info": "Afficahge page _PAGE_ par _PAGES_",
          "infoEmpty": "Pas de bon",
          "infoFiltered": "(Filtrer depuis _MAX_ jusqu'a records)",
          "paginate": {
            "first": "Premier",
            "last": "Fin",
            "next": "Suivant",
            "previous": "Précédent"
          }
        },
        pagingType: 'full_numbers',
        pageLength: 10,
        processing: true,
        "searching": true,
        "lengthMenu": [[ 10, 25, 50, -1], [ 10, 25, 50, "All"]]
      });
    }, 1000);
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
          "paginate": {
            "first": "Premier",
            "last": "Fin",
            "next": "Suivant",
            "previous": "Précédent"
          }
        },
        pagingType: 'full_numbers',
        pageLength: 10,
        processing: true,
        "lengthMenu": [[ 10, 25, 50, -1], [ 10, 25, 50, "All"]]
      });
    }, 1000);
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
  total_brut: string;
  ville: string;
  date_facture?:string;
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
  mnt_n:string,
  is_numprod_valid?:boolean
}
