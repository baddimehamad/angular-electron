import {EventEmitter} from "@angular/core";
export class Emitters{
static authemiter=new EventEmitter<boolean>();
static role=new EventEmitter<boolean>();
static correct=new EventEmitter<boolean>();
static updatevignetteid=new EventEmitter<number>();
static nom=new EventEmitter<string>();
static admincolor=new EventEmitter<string>();
}
