import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { title } from 'process';
import { GlobalConstants } from '../common/global-constants';
import { FormGroup, FormControl, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { LocalService } from '../local.service';
import { catchError, Observable, throwError } from 'rxjs';
import { Emitters } from '../emitters/emitters';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  title = GlobalConstants.siteTitle;
  username: string = "";
  password: string = "";
  result: any;
  authenticated: boolean;
  role: boolean;
  correct: boolean = false;
  isadmincolor: string = "";


  checkoutForm = this.formBuilder.group({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });
  heroes: any[] = [];
  test = "animate__fadeInUp";
  constructor(private router: Router, private formBuilder: FormBuilder, private httpClient: HttpClient, private localStore: LocalService) {
  }
  headers = new HttpHeaders()
    .append(
      'Content-Type',
      'application/json'
    );
  senduser(user: user): Observable<user> {
    return this.httpClient.post<user>('http://164.68.124.58:3000/login', { headers: this.headers, username: this.checkoutForm.value.username, password: this.checkoutForm.value.password })
      .pipe(
        catchError(this.handleError)
      );
  }
  baddi: user = {
    username: this.checkoutForm.value.username,
    password: this.checkoutForm.value.username
  }
  onSubmit() {
    /*this.httpClient.post('http://164.68.124.58:3000/login', { headers: this.headers, username: this.checkoutForm.value.username, password: this.checkoutForm.value.password }).subscribe((res:any) => {
      console.log(res.access_token);
      this.localStore.saveData("jwt",res.access_token);
      },err=>{
        console.log(err);

      });*/

    this.senduser(this.baddi).subscribe(hero => {
      this.heroes.push(hero);
      this.heroes.forEach(h => {
        console.log(h);
        this.localStore.saveData("jwt", h.access_token);
        this.localStore.saveData("id", h.user_id.toString());
        this.localStore.saveData("nom", h.nom);
        this.localStore.saveData("prenom", h.prenom);
        this.localStore.saveData("role", h.role);
        if(Number(h.role)==1){
          this.role=true;
          this.isadmincolor="isadmincolor1";
        }else{
          this.role=false;
          this.isadmincolor="isadmincolor";
        }
        Emitters.authemiter.emit(true);
        Emitters.admincolor.emit(this.isadmincolor);
        Emitters.role.emit(this.role);
        this.router.navigate(["/first"]);
      });
    });
    Emitters.correct.subscribe((cor:boolean)=>{
      this.correct=cor;

    })
    this.checkoutForm.reset();
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
      Emitters.correct.emit(true);
      return errorMessage;
    });
  }
  ngOnInit(): void {
    console.log('HomeComponent INIT');
    if (this.localStore.exist("jwt")) {
      this.router.navigate(["/liste_bon"]);
    }
  }



}
export interface user {
  username: string;
  password: string;
}

