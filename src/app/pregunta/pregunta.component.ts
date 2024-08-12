import { Component, Input, Inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { es, en, cat } from "../idioma";
import {pregs} from "../db-pregs"
import { initializeApp } from "firebase/app";
import 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, getDoc, doc, setDoc } from 'firebase/firestore';
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
import { intToHex } from '@ethereumjs/util';


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
  total_resp: any;
  idPreg: any;
  lastTransaction: any;
  
  provider: any;
  userDefined: any;
  providerETH = 'https://sepolia.infura.io/v3/d09825f256ae4705a74fdee006040903';
    
  //providerETH = 'http://127.0.0.1:7545/'; 
  contract: any;
  contract_address: any = "0x6dbb2806f3439D844CaB393d97D45e71372939a2";
  

  preg = {
    enunciado: "",
    recompensa: ""
  };

  dialogRef: any;
  dialogRefResp: any;
  datos: any;
  missCupoResp: Boolean;

  constructor(private service: AskEsbrinaService, private matDialog: MatDialog) {
    this.idiomaSelPreg = this.idiomaSel;
    this.web3 = this.web3obj;
    this.missCupoResp= this.idiomaSelPreg.m27; 
           
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
    this.contract = new this.web3obj.eth.Contract(ABI.default, this.contract_address);
    
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
async conPregsMaxID() {
  const queryPregs = query(collection(this.db, '/Pregs'),orderBy("order","desc"));
  const usSnapshot = await getDocs(queryPregs);
  const docs = usSnapshot.docs.map(doc => doc.data());
  const docs1 = usSnapshot.docs.map(doc => doc.id);
  console.log(this.totalPregs);
  console.log("Docs Id", docs1);
  console.log("Docs", docs);

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
  
  console.log("LLEGA1");
  this.balanceWalletAddress = await this.getBalanceAddress(this.wallet.address);
  // Usando Ganache retorna el valor del balance de la cuenta en ETH cuando deberian ser wei.
  const recompensaETH = this.web3obj.utils.fromWei(recompensa,"ether");
  console.log(this.balanceWalletAddress);
  console.log("Recompensa: ", recompensa);
  console.log("RecompensaETH: ", recompensaETH);
  if(recompensaETH < this.balanceWalletAddress){
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
        email: window.localStorage.getItem('esbrinaUserMail'),
        order: Date.now()
      };
    console.log(prg,"    -      ",this.totalPregs);
    await setDoc(doc(this.db, "Pregs", (this.totalPregs).toString()), prg);
    this.conPregsQuery();
    this.creaPreguntaSC(prg);

  }
    
}

  async numActualResps() {
    const queryResps = query(collection(this.db, '/Resps'));
    const usSnapshot = await getDocs(queryResps);
    if (usSnapshot.empty) return 0;
    else return usSnapshot.size;
    //console.log("Nº actual de respuestas",this.total_resp);
  }

  async conRespPregQuery(id_preg: any) {
    const queryResps = query(collection(this.db, '/Resps'), where("id_preg","==",id_preg), orderBy("id_resp","asc"));
    const usSnapshot = await getDocs(queryResps);
    if (usSnapshot.empty) return 0;
    else return usSnapshot.size;
  } 

async insertaRespuesta(idPreg:any, enunciado: any) {
    
  const idGlobalResps = await this.numActualResps();
  const respPregActual = await this.conRespPregQuery(idPreg);  
  const rsp = {
        email: window.localStorage.getItem('esbrinaUserMail'),
        id_resp: respPregActual+1,
        id_preg: idPreg,
        enunciado: enunciado,
        ganadora: false,
        votos: 0,
        anulada: false
        };
      console.log(rsp);
      await setDoc(doc(this.db, "Resps", (idGlobalResps + 1).toString()), rsp);
      this.conPregsQuery();
      this.creaRespuestaSC(rsp);
  }

  async creaRespuestaSC(rsp:any) {
   var rawData = {
      from: this.wallet.address, // admin (address generada con la semilla facilitada).
      to: this.contract_address,  
      value: 0,
      gasPrice: this.web3obj.utils.toHex(10000000000),
      gasLimit: this.web3obj.utils.toHex(1000000),
      nonce: await this.web3obj.eth.getTransactionCount(this.wallet.address),
      data: this.contract.methods.creaRespuesta(rsp.id_preg,rsp.enunciado, rsp.email, rsp.email, rsp.email).encodeABI()
    }
    console.log(rawData);
    console.log(this.wallet.privateKey);
    
    var signed = await this.web3obj.eth.accounts.signTransaction(rawData, this.wallet.privateKey.toString('hex'));

    this.web3obj.eth.sendSignedTransaction(signed.rawTransaction).then(
        (receipt: any) => {
          this.lastTransaction = receipt;
        },
        (error: any) => {
            console.log(error)
        }
    ); 
  }
  async noResps(id_preg: any) {
    const email = window.localStorage.getItem('esbrinaUserMail');
    const queryResps = query(collection(this.db, '/Resps'), where("id_preg","==",id_preg), where("email","==",email));
    const usSnapshot = await getDocs(queryResps);
    //const listaResps = usSnapshot.docs.map(doc => doc.data());
    //console.log("Lista respuestas", listaResps);
    if (usSnapshot.size==0)
    { return true; }
    else
    { return false; }
  }

  async dialogRespuesta(idPreg: any, email:any) {
    const usarDialog = await this.noResps(idPreg);
    let noAutorPreg = false;
    if (window.localStorage.getItem('esbrinaUserMail') != email) noAutorPreg = true;
    // console.log("usarDialog: ", usarDialog, "noAutor: ", noAutorPreg);
    if (usarDialog && noAutorPreg) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '70%';
      dialogConfig.autoFocus = true;
      dialogConfig.data = { enunciado: '' };
      this.dialogRefResp = this.matDialog.open(GetRespComponent, dialogConfig);
      this.datos = this.dialogRefResp.afterClosed().subscribe((result: any) => {
        if (result !== undefined) {
          this.insertaRespuesta(idPreg, result.enunciado);
          //console.log(idPreg, result.enunciado);
        }
      });
    } else {
      // visualizar aviso no se puede hacer más de una respuesta. (opcional)
    }
}  

  ngAfterViewInit() {
    //console.log("Lee todas las preguntas:");
    this.conPregsQuery();
    
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
  }

////////////// revisar si usar ///
creaPregunta() {
  let novaPreg:any = { };
  this.service.creaPregunta(this.web3obj, this.wallet, novaPreg);
  } 



  async creaPreguntaSC(prg:any) {
    
    var rawData = {
      from: this.wallet.address, // admin (address generada con la semilla facilitada).
      to: this.contract_address,  
      value: prg.recompensa,
      gasPrice: this.web3obj.utils.toHex(10000000000),
      gasLimit: this.web3obj.utils.toHex(1000000),
      nonce: await this.web3obj.eth.getTransactionCount(this.wallet.address),
      data: this.contract.methods.creaPregunta(prg.enunciado, prg.email, prg.email, prg.email).encodeABI()
    }
    console.log(rawData);
    console.log(this.wallet.privateKey);
    
    var signed = await this.web3obj.eth.accounts.signTransaction(rawData, this.wallet.privateKey.toString('hex'));

    this.web3obj.eth.sendSignedTransaction(signed.rawTransaction).then(
        (receipt: any) => {
          this.lastTransaction = receipt;
        },
        (error: any) => {
            console.log(error)
        }
    );
  }




} // end class

// 0xF562C02033DF4b174885D8c7678dC1489340F6d9