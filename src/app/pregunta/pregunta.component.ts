import { Component, Input, Inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { es, en, cat } from "../idioma";
import {pregs} from "../db-pregs"
import { initializeApp } from "firebase/app";
import 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { addDoc, Timestamp, query, orderBy, where } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { RespuestaComponent } from '../respuesta/respuesta.component';
import { AskEsbrinaService } from '../ask-esbrina.service';
import Web3 from 'web3';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogRef, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import {CdkTextareaAutosize, TextFieldModule} from '@angular/cdk/text-field';
import { ABI } from '../esbrinachain';
import { GetPregComponent } from '../get-preg/get-preg.component';

@Component({
  selector: 'app-pregunta',
  standalone: true,
  imports: [MatButtonModule, RespuestaComponent, MatIconModule, TextFieldModule, GetPregComponent],
  templateUrl: './pregunta.component.html',
  styleUrl: './pregunta.component.scss'
})
export class PreguntaComponent {

  @Input()
  idiomaSel: any = es;
  @Input()
  web3obj: any;
  @Input()
  wallet: any;
  
  idiomaSelPreg: any;
  app: any;
  db: any;
  analytics: any;
  listaPregs: any;
  totalPregs: any;
  listaPregs1: any;
  totalPregs1: any;
  web3: any;
  balanceWalletAddress: any;
  
  provider: any;
  userDefined: any;
  //providerETH = 'https://sepolia.infura.io/v3/d09825f256ae4705a74fdee006040903';
    
  providerETH = 'http://127.0.0.1:7545/'; 
  contract: any;
  contract_address: any = "0x3823FFDd21278C0c9A3b4174992156beF4A285B3";
  

  preg = {
    enunciado: "",
    recompensa: ""
  };

  dialogRef: any;
  datos: any;

  constructor(private service: AskEsbrinaService, private matDialog: MatDialog) {
    this.idiomaSelPreg = this.idiomaSel;
    this.web3 = this.web3obj;
  }


  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.idiomaSelPreg = this.idiomaSel;

    const firebaseConfig = {
          apiKey: "AIzaSyAHz9zSUk258f3CyoMA2cvE8Kf2BnF442c",
          authDomain: "esbrinachain-777.firebaseapp.com",
          projectId: "esbrinachain-777",
          storageBucket: "esbrinachain-777.appspot.com",
          messagingSenderId: "825098637790",
          appId: "1:825098637790:web:1c3930b7e4033004c70d4f",
          measurementId: "G-Y0VFSVPTBC"
        };
        
    this.app = initializeApp(firebaseConfig);
    this.db = getFirestore(this.app);
    this.analytics = getAnalytics(this.app);
    
  }
  
  ngAfterViewInit() {
    //console.log("Lee todas las preguntas:");
    this.conPregsQuery();
  }

convertDate(firebaseObject: any) {
    if (!firebaseObject) return null;
    for (const [key, value] of Object.entries(firebaseObject)) {
      // convert simple properties
      if (value && value.hasOwnProperty('seconds'))
        firebaseObject[key] = (value as Timestamp).toDate();
    }
    return firebaseObject;
  }

async conPregs1Query() {
    const queryPregs = query(collection(this.db, '/Pregs1'),orderBy('idp','asc'));
    const usSnapshot = await getDocs(queryPregs);
    this.listaPregs1 = usSnapshot.docs.map(doc => doc.data());
  this.totalPregs1 = usSnapshot.size;
  console.log(this.listaPregs1[0]);

}


async conPregsQuery() {
    const queryPregs = query(collection(this.db, '/Pregs'),orderBy('idp','asc'));
    const usSnapshot = await getDocs(queryPregs);
    this.listaPregs = usSnapshot.docs.map(doc => doc.data());
  this.totalPregs = usSnapshot.size;
  //console.log(this.listaPregs[0]);

}

async insPregs() {
    for(let i = 0; i<pregs.length; i++)
      await setDoc(doc(this.db, "Pregs", (i + 1).toString()), pregs[i]);
      //console.log(i+1, pregs[i]);
}
 
async getBalanceAddress(address:any) {
    var valor = await this.web3.eth.getBalance(address); 
    var valorEther = this.web3.utils.fromWei(valor, 'ether');
    this.balanceWalletAddress = valorEther;
    return valorEther;
}
  
  async insertaPregunta(data: any) {
    this.balanceWalletAddress = this.getBalanceAddress(this.wallet.address);
    if(data.recompensa >= this.balanceWalletAddress){
        this.totalPregs++;
        const prg = {
          idp: this.totalPregs,
          anulada: false,
          autor: "",
          autor_address: this.wallet.address,
          creada: Date.now(),
          enunciado: data.enunciado,
          estado: "activa",
          fecha_votacion: Date.now() + 604800,
          idioma: "es",
          recompensa: data.recompensa,
          email: window.localStorage.getItem('esbrinaUserMail')
        };
        const balance = await this.getBalanceAddress(this.wallet.address);
        await setDoc(doc(this.db, "Pregs", this.totalPregs), prg);
    }
}
  
////////////// revisar si usar ///
creaPregunta() {
  let novaPreg:any = { };
  this.service.creaPregunta(this.web3, this.wallet, novaPreg);
  }  

showDialog(){
    
  const dialogConfig = new MatDialogConfig();
  dialogConfig.width = '70%';
  dialogConfig.autoFocus = true;
  dialogConfig.data = { enunciado: '', recompensa: '0' };

  let dialogRef = this.matDialog.open(GetPregComponent, dialogConfig);

  dialogRef.afterClosed().subscribe((result: any) => { console.log(result); });
  
  //this.insertaPregunta();  
  //console.log("Enunciado: ", this.datos.enunciado);
  //console.log("Recompensa: ", this.datos.recompensa);
  }

}




// 0xF562C02033DF4b174885D8c7678dC1489340F6d9