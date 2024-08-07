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
import { GetRespComponent } from '../get-resp/get-resp.component';

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
  fecha1: any;
  fecha: any;

  preg = {
    enunciado: "",
    recompensa: ""
  };

  dialogRef: any;
  dialogRefResp: any;
  datos: any;

  constructor(private service: AskEsbrinaService, private matDialog: MatDialog) {
    this.idiomaSelPreg = this.idiomaSel;
    this.web3 = this.web3obj;
    //this.fecha = this.creaDate(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000));
        
  }

  creaDate(d:any) {
  var yyyy = d.getFullYear().toString();
  var mm = (d.getMonth()+1).toString();
  var dd  = d.getDate().toString();

  var mmChars = mm.split('');
  var ddChars = dd.split('');

  return  (ddChars[1]?dd:"0"+ddChars[0]) + '/' + (mmChars[1]?mm:"0"+mmChars[0]) + '/'  + yyyy;
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
    var valor = await this.web3obj.eth.getBalance(address); 
    var valorEther = this.web3obj.utils.fromWei(valor, 'ether');
    this.balanceWalletAddress = valorEther;
    return valorEther;
}
  
  async insertaPregunta(enunciado: any, recompensa: any) {
    
    this.balanceWalletAddress = await this.getBalanceAddress(this.wallet.address);
    
    if(recompensa < this.balanceWalletAddress){
      this.totalPregs++;
        const prg = {
          idp: this.totalPregs,
          anulada: false,
          autor: window.localStorage.getItem('esbrinaUserMail'),
          autor_address: this.wallet.address,
          creada: this.creaDate(new Date(new Date().getTime())),
          enunciado: enunciado,
          estado: "activa",
          fecha_votacion: this.creaDate(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)),
          idioma: "es",
          recompensa: recompensa,
          email: window.localStorage.getItem('esbrinaUserMail')
        };
      console.log(prg);
      await setDoc(doc(this.db, "Pregs", (this.totalPregs + 1).toString()), prg);
      this.conPregsQuery();
    }
    
}
 

  async insertaRespuesta(idPreg:any, enunciado: any) {
    

      this.totalPregs++;
        const rsp = {
          idp: this.totalPregs,
          anulada: false,
          autor: window.localStorage.getItem('esbrinaUserMail'),
          autor_address: this.wallet.address,
          creada: this.creaDate(new Date(new Date().getTime())),
          enunciado: enunciado,
          estado: "activa",
          fecha_votacion: this.creaDate(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)),
          idioma: "es",
          recompensa: "",
          email: window.localStorage.getItem('esbrinaUserMail')
        };
      console.log(rsp);
      await setDoc(doc(this.db, "Resps", (1).toString()), rsp);
      
    
}
  dialogRespuesta(idPreg: any) {
  
  const dialogConfig = new MatDialogConfig();
  dialogConfig.width = '70%';
  dialogConfig.autoFocus = true;
  dialogConfig.data = { enunciado: ''};

  this.dialogRefResp = this.matDialog.open(GetRespComponent, dialogConfig);

  this.datos = this.dialogRefResp.afterClosed().subscribe((result: any) => { 
    if (result !== undefined)
    {
      //this.insertaRespuesta(idPreg, result.enunciado);  
      console.log(idPreg,result.enunciado);
      }
  });
  
}  
  
  
  
  
  
  
  
////////////// revisar si usar ///
creaPregunta() {
  let novaPreg:any = { };
  this.service.creaPregunta(this.web3obj, this.wallet, novaPreg);
  }  

showDialog(){
    
  const dialogConfig = new MatDialogConfig();
  dialogConfig.width = '70%';
  dialogConfig.autoFocus = true;
  dialogConfig.data = { enunciado: '', recompensa: '0' };

  this.dialogRef = this.matDialog.open(GetPregComponent, dialogConfig);

  this.datos = this.dialogRef.afterClosed().subscribe((result: any) => { 
    if(result !== undefined) this.insertaPregunta(result.enunciado, result.recompensa);
  });
  
  
  //this.insertaPregunta();  
  //console.log("Enunciado: ", this.datos.enunciado);
  //console.log("Recompensa: ", this.datos.recompensa);
  }

}




// 0xF562C02033DF4b174885D8c7678dC1489340F6d9