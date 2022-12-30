import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { LocalService } from '../local.service';
@Injectable()
export class GlobalConstants {
  constructor(private localStore: LocalService,private httpClient: HttpClient){

  }
  public static apiURL: string = "https://www.dup.sarl/";
  public static siteTitle: string = "This is Vignette of DUP.SARL";

}
