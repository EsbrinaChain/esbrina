import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AskEsbrinaService {

  constructor() { }

  creaPregunta(web3:any,wallet:any, packPreg:any) {
    console.log("Creando una Pregunta al SC");
    console.log(wallet.address);

  }
}
