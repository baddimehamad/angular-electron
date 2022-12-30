import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { GlobalConstants } from '../common/global-constants';
import { catchError, Observable, throwError } from 'rxjs';
import { LocalService } from '../local.service';
import { Emitters } from '../emitters/emitters';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import * as Excel from 'exceljs/dist/exceljs';
import { ExcelService } from '../excel.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Importer } from 'xlsx-import/lib/Importer';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import { Workbook } from 'exceljs';
import { formatDate } from '@angular/common';
import { NotifierService } from 'angular-notifier';
declare var $;

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class LfactureComponent implements OnInit {
  @ViewChild('htmlData') htmlData!: ElementRef;
  title = 'angular-app';
  total_vignette: number = 0;
  total_brut: number = 0;
  total_remise: number = 0;
  total_net: number = 0;
  invoice: any | null = null;
  fileName = 'ExcelSheet.xlsx';
  allbons: any = [];
  ckecked_bons: Array<string> = [];
  auth: boolean;
  displayStyle = "none";
  displayStyletxt = "none";
  displayStyleexcel = "none";
  displayStyledevalide = "none";
  authenticated: boolean;
  deletenone: string;
  id_delete: number;
  numero_facture: number;
  date_facture: number;
  checkboxes_diabled: boolean = false;
  isChecked;
  isCheckedName;
  isCheckvalue;
  dansrelevet=false;
  id: string = this.localStore.getData("updatevignetteid");
  modal_var: string = "animate__backInDown";
  modal_opened: string = "";
  userList = [];
  constructor(private router: Router, private formBuilder: FormBuilder, private httpClient: HttpClient, private localStore: LocalService, private glob: GlobalConstants, private excel: ExcelService,	private notifier: NotifierService) {
    let d = new Date(localStore.getData("expires"));
    let now = new Date();
    if (now > d) {
      localStore.clearData();
      Emitters.authemiter.emit(false);
      this.router.navigate(["/home"]);
    }
  }
  checkoutForm = this.formBuilder.group({
    nume_facture: new FormControl('', [Validators.required]),
    date_facture: new FormControl('', [Validators.required])
  });
  private onDownloadInvoice(): Promise<Blob> {
    return fetch(__dirname+'/assets/f1.xlsx').then((r) => r.blob());
    //return fetch('../assets/f1.xlsx').then((r) => r.blob());
  }
  private onDownloadReleve(): Promise<Blob> {
    return fetch(__dirname+'/assets/r1.xlsx').then((r) => r.blob());
  }
  public openPDF(): void {
    /*let DATA: any = document.getElementById('datatableexample');
    html2canvas(DATA).then((canvas) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
      PDF.save('angular-demo.pdf');
    });*/
    const doc = new jsPDF();

    doc.text("Hello world!", 10, 10);
    doc.save("a4.pdf");
  }
  async onUpload(): Promise<void> {
    const invoiceFile = await this.onDownloadInvoice();
    //console.log(__dirname);
    var allbons: Array<any> = [];
    var total_mnt=0, total_brut=0, total_remise=0, total_net=0;
    this.getfactureallbons(this.numero_facture).subscribe((bon: Array<any>) => {
      allbons = bon;
      console.log(bon);

      var reference_facture="";
      var date_facture;
      const reader = new FileReader();
      var i = 14;
      reader.readAsArrayBuffer(invoiceFile);
      reader.addEventListener('loadend', async () => {
        if (reader.result instanceof ArrayBuffer) {
          const wb = new Workbook();
          await wb.xlsx.load(reader.result);
          wb.xlsx.load(reader.result)
            .then(function () {
              const worksheet = wb.getWorksheet(1);
              //console.log('rowCount: ', worksheet.rowCount);
              console.log(allbons);
              allbons.forEach((el) => {
                worksheet.getCell('A11').value = "FACTURE : "+el.refefact;
                // Create a date object from a date string
                var date = new Date(el.date_facture);
                worksheet.getCell('A' + i).value = el.codalfbo + el.nume_bon;
                var jour=el.date_bon.toString().slice(0,2);
                var mois=el.date_bon.toString().slice(2,4);
                var annee=el.date_bon.toString().slice(4,8);
                    // Get year, month, and day part from the date
                var year = date.toLocaleString("default", { year: "numeric" });
                var month = date.toLocaleString("default", { month: "2-digit" });
                var day = date.toLocaleString("default", { day: "2-digit" });
                worksheet.getCell('I11').value = "DATE : "+day + "-" + month + "-" + year;
                worksheet.getCell('B' + i).value = jour+"/"+mois+"/"+annee;
                worksheet.getCell('C' + i).value = el.station_name;
                worksheet.getCell('D' + i).value = el.numeimma.toString().toUpperCase();
                worksheet.getCell('E' + i).value = el.produit;
                worksheet.getCell('F' + i).value = String(el.quantite).replace('.',',');
                worksheet.getCell('G' + i).value = el.prixunit.replace('.',',');
                worksheet.getCell('H' + i).value = el.montvign.replace('.',',');
                var taux=Number(el.taux)/100;
                reference_facture=el.refefact;
                total_mnt +=Number(Number(el.montvign).toFixed(2));
                worksheet.getCell('I' + i).value = Number(Number(el.quantite) * Number(el.prixunit)).toFixed(2).replace('.',',');
                total_brut +=Number((Number(el.quantite) * Number(el.prixunit)).toFixed(2));
                worksheet.getCell('J' + i).value = Number(Number(el.quantite) * Number(el.prixunit) * taux).toFixed(2).replace('.',',');
                total_remise +=Number((Number(el.quantite) * Number(el.prixunit) * taux).toFixed(2));
                worksheet.getCell('K' + i).value = (Number(Number(el.quantite) * Number(el.prixunit)) - Number(Number(el.quantite) * Number(el.prixunit) * taux)).toFixed(2).replace('.',',');
                total_net +=Number((Number(Number(el.quantite) * Number(el.prixunit)) - Number(Number(el.quantite) * Number(el.prixunit) * taux)).toFixed(2));
                i++;
              })
              worksheet.getCell('K39').value=Number(total_mnt).toFixed(2);
              worksheet.getCell('K40').value=Number(total_brut).toFixed(2);
              worksheet.getCell('K41').value=Number(total_remise).toFixed(2);
              worksheet.getCell('K42').value=Number(total_net).toFixed(2);

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
                    link.download = "facture-"+reference_facture+".xlsx";
                    link.click();
                  })
                  .catch(console.error);
              })
            });
        }
      });
    })
    this.closePopup();
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
    //console.log(this.displayStyle+" / "+this.displayStyletxt+" / "+this.displayStyleexcel+" / ");
  }
  openPopuptxt(id, dt) {
    this.numero_facture = id;
    this.date_facture = dt;
    this.displayStyletxt = "block";
    this.modal_var = "animate__backInDown";
    this.deletenone = "animate__bounce animate__delay-1s";
    //console.log(this.displayStyle+" / "+this.displayStyletxt+" / "+this.displayStyleexcel+" / ");
  }

  openPopupdevalide(id) {
    this.numero_facture = id;
    this.displayStyledevalide = "block";
    this.modal_var = "animate__backInDown";
    this.deletenone = "animate__bounce animate__delay-1s";
    //console.log(this.displayStyle+" / "+this.displayStyletxt+" / "+this.displayStyleexcel+" / ");
  }

  openPopupexcel(id, dt) {
    this.numero_facture = id;
    this.date_facture = dt;
    this.displayStyleexcel = "block";
    this.modal_var = "animate__backInDown";
    this.deletenone = "animate__bounce animate__delay-1s";
    //console.log(this.displayStyle+" / "+this.displayStyletxt+" / "+this.displayStyleexcel+" / ");
  }
  closePopup() {
    this.displayStyle = "none";
    this.modal_var = "animate__backOutDown";
    this.deletenone = "";
  }
  closePopupdevalide() {
    this.modal_var = "animate__backOutDown";
    this.displayStyledevalide = "none";
    this.numero_facture = 0;
  }
  closePopuptxt() {
    this.modal_var = "animate__backOutDown";
    this.displayStyletxt = "none";
    this.deletenone = "";
  }
  closePopupexcel() {
    this.modal_var = "animate__backOutDown";
    this.displayStyleexcel = "none";
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

      this.ckecked_bons.push(el.value);
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
  downloadObjectAsJson() {
    var data: string = "";
    var codef = "00";
    var reff = "";
    var mont_t: number = 0;
    this.getfactureallbons(this.numero_facture).subscribe((bon: Array<vignette>) => {
      //console.log(bon);
      var jour;
      var mois;
      var annee;
      var reference_facture;
      var mois_facture;
      bon.forEach(el => {
        var m1 = "", m2 = "";
        var matricule = "";
        mois_facture=Number(Number(new Date(el.date_facture).getMonth())+1).toString();
        var taux=Number(el.taux)/100;
        var q = (Number(Number(el.quantite).toFixed(2)) * 100).toFixed(0).toString().padStart(6, '0');
        var pu = (Number(Number(el.prixunit).toFixed(2)) * 100).toFixed(0).toString().padEnd(6, '0');
        var mntv = (Number(Number(el.montvign).toFixed(2)) * 100).toFixed(0).toString().padStart(7, '0');
        //console.log(q+" \ "+pu+" \ "+mntv);

        if (el.numeimma.toString().toUpperCase().indexOf('H') == -1) {
          m1 = el.numeimma.substring(0, 1).toUpperCase();
          var numb = el.numeimma.match(/\d/g);
          m2 = numb.join("").padStart(7, '0');
          matricule = m1 + m2;
        } else {
          m1 = el.numeimma.substring(0, 1).toUpperCase();
          var numb = el.numeimma.match(/\d/g);
          m2 = numb.join("").padEnd(7, '0');
          matricule = m2 + m1;
        }
        if(el.code_for==null){
          el.code_for="30";
        }

        data += el.bon_fact.padStart(1, '0') + el.code_for.padStart(2, '0') + el.refefact.padStart(6, '0') + mois_facture.padStart(2, '0') + el.annee_bon.padStart(4, '0') + el.date_bon.padStart(8, '0') + matricule + el.codalfbo.padStart(2, '0') + el.nume_bon.padStart(6, '0') + el.numeprod.padStart(3, '0') + q + pu + mntv + el.kilometr.padStart(6, '0') + '\n';
        //data+=el.bon_fact.padStart(1,'0')+" \ "+el.code_for.padStart(2,'0')+" \ "+el.refefact.padStart(6,'0')+" \ "+el.mois_bon.padStart(2,'0')+" \ "+el.annee_bon.padStart(4,'0')+" \ "+el.date_bon.padStart(8,'0')+" \ "+matricule+" \ "+el.codalfbo.padStart(2,'0')+" \ "+el.nume_bon.padStart(6,'0')+" \ "+el.numeprod.padStart(3,'0')+" \ "+q+" \ "+" \ "+" \ "+pu+" \ "+mntv+" \ "+el.kilometr.padStart(6,'0')+" \ "+'\n';
        codef = el.code_for.padStart(2, '0');
        reff = el.refefact.padStart(6, '0');
        mont_t += Number((Number(Number(el.quantite) * Number(el.prixunit)) - ((Number(el.quantite) * Number(el.prixunit)) * taux)).toFixed(2));
         jour=el.toString().slice(0,2);
         mois=el.date_bon.toString().slice(2,4);
         annee=el.date_bon.toString().slice(4,8);
         reference_facture=el.refefact;
      });
      //console.log((mont_t*100).toString().padStart(9,'0'));
      data += '1' + codef.padStart(2, '0') + reff.padStart(6, '0') + mois_facture+annee + "                                                                      " + (mont_t * 100).toFixed(0).toString().padStart(9, '0');
      //console.log(data);
      let exportname = "facture-"+reference_facture;
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(data);
      var downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", exportname + ".txt");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    });
  }
  downloadFile(data: string) {
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  }
  getAllfacture(): Observable<any> {
    return this.httpClient.get<any>('http://164.68.124.58:3000/facture', {
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
  getfactureallbons(id: number): Observable<any> {
    return this.httpClient.get<any>('http://164.68.124.58:3000/facture/' + id, {
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
  devaliderfacture(id: number): Observable<any> {
    return this.httpClient.get<any>('http://164.68.124.58:3000/facture/devalide/' + id, {
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
  relevet(data_to_send: Array<string>): Observable<any> {
    return this.httpClient.post<any>('http://164.68.124.58:3000/vignette/relevet', data_to_send, {
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
  devaliderfacture_button(id_facture) {
    this.devaliderfacture(id_facture).subscribe((bon: any) => {
      console.log(bon);
    });
    this.closePopup();
    this.router.navigate(['/liste_bon'])
  }
  showNotification(type,message): void {
    this.notifier.notify(type, message );
  }
  relevete() {
    var ckecked_bons_send: Array<string> = [];
    this.ckecked_bons.forEach(element => {
      ckecked_bons_send.push(element);
    });
    ckecked_bons_send.push(this.checkoutForm.value.nume_facture, this.checkoutForm.value.date_facture);
    //console.log(ckecked_bons_send);

    this.relevet(ckecked_bons_send).subscribe((bon: any) => {
      //console.log(bon);
    this.showNotification("success","Relevet AJOUTER AVEC SUCCESS.");
  },err=>{
    this.showNotification("error","Relevet N'EST PAS AJOUTER.");
  });
    this.checkoutForm.reset();
    setTimeout(() => {
      this.router.navigate(['/liste_relevet']);
    }, 1500);
    this.closePopup();
  }
  updatevignette(id: number) {
    this.localStore.saveData("updatevignetteid", id.toString());
    this.router.navigateByUrl("/update_vignette");
  }
  ngOnInit(): void {
    this.getAllfacture().subscribe((bon: any) => {
      this.allbons = bon;
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
        pageLength: 10,
        processing: true,
        "searching": true,
        "lengthMenu": [[ 10, 25, 50, -1], [ 10, 25, 50, "All"]]
      });
    }, 500);
  }
  updatetable() {
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
        pageLength: 10,
        processing: true,
        "lengthMenu": [[ 10, 25, 50, -1], [ 10, 25, 50, "All"]]
      });
    }, 500);
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
  taux?:string;
}
export interface bon {
  numero: number,
  date: string,
  lieu: string,
  matricule: string,
  designation: string,
  pu: string,
  mnt_v: string,
  mnt_b: string,
  remise: string,
  mnt_n: string
}
