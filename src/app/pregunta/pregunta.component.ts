import { Component, Input, Inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatListModule} from '@angular/material/list';
import { es, en, cat } from "../idioma";
import {pregs} from "../db-pregs"
import { initializeApp } from "firebase/app";
import 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, documentId} from 'firebase/firestore';
import { addDoc, Timestamp, query, orderBy, where, and } from 'firebase/firestore';
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
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-pregunta',
  standalone: true,
  imports: [MatButtonModule, RespuestaComponent, MatIconModule, TextFieldModule, CommonModule,
    GetPregComponent, MatSelectModule, MatFormFieldModule, MatListModule,FormsModule, ReactiveFormsModule],
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
  @Input()
  metamask: any = false;

  idiomaSelPreg: any;

  
  app: any;
  db: any;
  analytics: any;
  listaPregs: any;
  totalPregs: any = 0;
  listaPregs1: any;
  totalPregs1: any;
  
  web3: any;
  balanceWalletAddress: any;
  total_resp: any = 0;
  idPreg: any;
  lastTransaction: any;
  
  // Variable de S.C.
  tiempo_votacion_sc: any;
  tiempo_respuesta_sc: any;
  num_incr_recompensa_sc: any;
  cupo_respuestas_sc: any;
  tiempo_respuesta_convertido: any;
  datosActualizadosPregunta: any;
  //admin_address: any;
  
  provider: any;
  userDefined: any;
  providerETH = 'https://sepolia.infura.io/v3/d09825f256ae4705a74fdee006040903';
  contract_address: any = "0x2B918F8cADC5905C1A00e652a2983027561D2439";
    
  contract: any;
  //providerETH = 'http://127.0.0.1:7545/'; 
  //contract_address: any = "0x7a588bF361542fb2aD6191fe467e83fb097E1Ea6";
  
  

  preg = {
    enunciado: "",
    recompensa: ""
  };

  dialogRef: any;
  dialogRefResp: any;
  datos: any;
  missCupoResp: Boolean;

  // Event variables

  eventPreguntaCreada: any;
  eventPreguntaAnulada: any;

  eventRespuestaCreada: any;
  eventRespuestaFueraDeTiempo: any;
  eventRespuestaFueraDeCupo: any;
  
  eventInicioVotacion: any;
  eventFinalVotacion: any;
  

  constructor(private service: AskEsbrinaService, private matDialog: MatDialog) {
    this.idiomaSelPreg = this.idiomaSel;
    this.missCupoResp= this.idiomaSelPreg.m27; 
        
  }


secondsToDhms(seconds:any) {
seconds = Number(seconds);
var d = Math.floor(seconds / (3600*24));
var h = Math.floor(seconds % (3600*24) / 3600);
var m = Math.floor(seconds % 3600 / 60);
var s = Math.floor(seconds % 60);

var dDisplay = d > 0 ? d + (d == 1 ? " dia " : " dias ") : "";
var hDisplay = h > 0 ? h + (h == 1 ? " hora " : " horas, ") : "";
var mDisplay = m > 0 ? m + (m == 1 ? " min. " : " min. ") : "";
var sDisplay = s > 0 ? s + (s == 1 ? " seg." : " seg.") : "";
return dDisplay + hDisplay + mDisplay + sDisplay;
}
  // consulta de una variable de S.C. await this.contract.methods.variable().call()
async consultaVariables() {
  
  this.tiempo_respuesta_sc = this.secondsToDhms(await this.contract.methods.tiempo_respuesta().call());
  this.tiempo_votacion_sc = this.secondsToDhms(await this.contract.methods.tiempo_votacion().call());
  this.cupo_respuestas_sc = await this.contract.methods.cupo_respuestas().call();

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
    this.web3 = this.web3obj;
    this.contract = new this.web3obj.eth.Contract(ABI.default, this.contract_address);
    this.consultaVariables();
    //setInterval(() => { this.conPregsQuery(); }, 1000);
    
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

  async creaPreguntaSC(enunciado:any, recompensa:any) {
    const email = window.localStorage.getItem('esbrinaUserMail');
    var rawData = {
      from: this.wallet.address, // admin (address generada con la semilla facilitada).
      to: this.contract_address,  
      value: recompensa,
      gasPrice: this.web3obj.utils.toHex(10000000000),
      gasLimit: this.web3obj.utils.toHex(1000000),
      nonce: await this.web3obj.eth.getTransactionCount(this.wallet.address),
      data: this.contract.methods.creaPregunta(enunciado, email, email, email).encodeABI()
    }
    //console.log(rawData);
    var signed: any;
    if (this.metamask) {
      this.web3obj.eth.sendTransaction(rawData).then(
        (receipt: any) => {
          this.lastTransaction = receipt;
          this.insertaPregunta(enunciado, recompensa);
          },
          (error: any) => {
              console.log(error)
          }
      );
     }
    else {
      signed = await this.web3obj.eth.accounts.signTransaction(rawData, this.wallet.privateKey.toString('hex'));
      this.web3obj.eth.sendSignedTransaction(signed.rawTransaction).then(
        (receipt: any) => {
          console.log("Receipt: ", receipt);
          this.insertaPregunta(enunciado, recompensa);
          },
        (error: any) => {
            console.log(error);
          }
      ); 
    }
  }
  
async insertaPregunta(enunciado: any, recompensa: any) {
  this.balanceWalletAddress = await this.getBalanceAddress(this.wallet.address);
  // Usando Ganache retorna el valor del balance de la cuenta en ETH cuando deberian ser wei.
  const recompensaETH = this.web3obj.utils.fromWei(recompensa,"ether");
  //console.log(this.balanceWalletAddress);
  //console.log("Recompensa: ", recompensa);
  //console.log("RecompensaETH: ", recompensaETH);
  if(recompensaETH < this.balanceWalletAddress){
    this.totalPregs++;
      const prg = {
        idp: this.totalPregs,
        anulada: false,
        autor: window.localStorage.getItem('esbrinaUserMail'),
        autor_address: this.wallet.address,
        creada: this.creaDate(new Date(new Date().getTime())),
        enunciado: enunciado,
        estado: "abierta",
        fecha_votacion: this.creaDate(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)),
        idioma: "es",
        recompensa: Number(recompensa),
        email: window.localStorage.getItem('esbrinaUserMail'),
        order: Date.now()
      };
    //console.log("Pregunta: ",prg,"Total Preguntas: ",this.totalPregs);
    await setDoc(doc(this.db, "Pregs", (this.totalPregs).toString()), prg);
    this.conPregsQuery();
    
    this.getLogPreguntaCreada(this.totalPregs);

  }
    
}

  async numActualResps() {
    const queryResps = query(collection(this.db, '/Resps'));
    const usSnapshot = await getDocs(queryResps);
    if (usSnapshot.empty) this.total_resp = 0;
    else this.total_resp = usSnapshot.size;
    console.log("Nº actual de respuestas", usSnapshot.size);
    console.log("Nº actual de respuestas",this.total_resp);
  }

  async conRespPregQuery(id_preg: any) {
    const queryResps = query(collection(this.db, '/Resps'), where("id_preg","==",id_preg), orderBy("id_resp","asc"));
    const usSnapshot = await getDocs(queryResps);
    if (usSnapshot.empty) return 0;
    else return usSnapshot.size;
  } 

async insertaRespuesta(idPreg:any, enunciado: any) {
  const respPregActual = await this.contract.methods.calcRespAPreg(Number(idPreg)).call();
  console.log("respPregActual: ", respPregActual);
  const numRespPreg = respPregActual.length;
  const rsp = {
        email: window.localStorage.getItem('esbrinaUserMail'),
        id_resp: numRespPreg,
        id_preg: Number(idPreg),
        enunciado: enunciado,
        ganadora: false,
        votos: 0,
        anulada: false
        };
      console.log("Respuesta introducida: ",rsp);
      await setDoc(doc(this.db, "Resps", (this.total_resp).toString()), rsp);
      this.conPregsQuery();
  }

  async creaRespuestaSC(id_preg: any, enunciado: any) {
   const email =window.localStorage.getItem('esbrinaUserMail');
   var rawData = {
      from: this.wallet.address, // admin (address generada con la semilla facilitada).
      to: this.contract_address,  
      value: 0,
      gasPrice: this.web3obj.utils.toHex(10000000000),
      gasLimit: this.web3obj.utils.toHex(1000000),
      nonce: await this.web3obj.eth.getTransactionCount(this.wallet.address),
      data: this.contract.methods.creaRespuesta(id_preg,enunciado, email, email, email).encodeABI()
    }
    //console.log(rawData);
    var signed: any;
    if (this.metamask) {
      this.web3obj.eth.sendTransaction(rawData).then(
        (receipt: any) => {
          this.lastTransaction = receipt;
          this.total_resp++;
          this.insertaRespuesta(id_preg, enunciado);
          },
          (error: any) => {
              console.log(error)
          }
      );
     }
    else {
      signed = await this.web3obj.eth.accounts.signTransaction(rawData, this.wallet.privateKey.toString('hex'));
      this.web3obj.eth.sendSignedTransaction(signed.rawTransaction).then(
        (receipt: any) => {
          console.log("Receipt: ", receipt);
          this.total_resp++;
          this.insertaRespuesta(id_preg, enunciado);
          },
        (error: any) => {
            console.log(error);
          }
      ); 
    }
    
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

  fechaUnixToDDMMAAAA(f_vot: any) {
    const valor = Number(f_vot) * 1000;
    let f = new Date(valor);
    
    let dia = f.getDate();
    let dia1=(dia < 10) ? "0" + dia : dia;
    let mes = f.getMonth() + 1;
    let mes1 = (mes < 10) ? "0" + mes : mes;
    let aaaa = f.getFullYear();
    const fecha = dia1 + "/" + mes1 + "/" + aaaa;
 
    return  fecha;
  
  }
  async updPregBackend(id_preg: any, estado: any, rcp: any, f_vot: any) {
    
    const docRef = doc(this.db, "Pregs", id_preg.toString());
    const docSnap = await getDoc(docRef);

    const estado_txt = (estado == 0) ? "abierta" : (estado == 1) ? "votando" : (estado == 2) ? "consulta" : (estado == 3) ? "anulada": undefined;
    if (docSnap.exists()) {
      let prg = docSnap.data();
      //console.log("prg antes: ", prg);
      prg['estado'] = estado_txt;
      prg['anulada'] = (estado == 3) ? true : false;
      prg['recompensa'] = Number(rcp);
      if (f_vot != 0) { prg['fecha_votacion'] = this.fechaUnixToDDMMAAAA(f_vot); }
      //console.log("prg después: ", prg);
      await setDoc(docRef, prg);
    } 
    
  }
  
  async actualizaDatosPregSC(id_preg:any) {
    this.datosActualizadosPregunta = await this.contract.methods.preguntas(Number(id_preg)).call();
    //console.log("Datos leidos pregunta: ",id_preg, this.datosActualizadosPregunta);
    const estado_blk = this.datosActualizadosPregunta.estado;
    const estado_txt = (estado_blk == 0) ? "abierta" : (estado_blk == 1) ? "votando" : (estado_blk == 2) ? "consulta" : (estado_blk == 3) ? "anulada": undefined;
    this.listaPregs[id_preg - 1].estado = estado_txt;
    this.listaPregs[id_preg - 1].recompensa = this.datosActualizadosPregunta.recompensa;
    if (this.datosActualizadosPregunta.fecha_votacion != 0) {
      this.listaPregs[id_preg - 1].fecha_votacion = this.fechaUnixToDDMMAAAA(this.datosActualizadosPregunta.fecha_votacion);
    }
    this.updPregBackend(id_preg,
                        this.datosActualizadosPregunta.estado,
                        this.datosActualizadosPregunta.recompensa,
                        this.datosActualizadosPregunta.fecha_votacion);

    
  }

  async dialogRespuesta(idPreg: any, email: any) {
    this.actualizaDatosPregSC(idPreg);
    const usarDialog = await this.noResps(idPreg);
    let noAutorPreg = false;
    if (window.localStorage.getItem('esbrinaUserMail') != email) noAutorPreg = true;
    // console.log("usarDialog: ", usarDialog, "noAutor: ", noAutorPreg);
    //this.actualizaDatosPregSC(idPreg);
    const estado_actual = await this.contract.methods.estadoPreg(idPreg).call();
    console.log("Estado_actual: ",estado_actual);
    if (usarDialog && noAutorPreg && estado_actual=='Abierta.') {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '70%';
      dialogConfig.autoFocus = true;
      dialogConfig.data = { enunciado: '' };
      this.dialogRefResp = this.matDialog.open(GetRespComponent, dialogConfig);
      this.datos = this.dialogRefResp.afterClosed().subscribe((result: any) => {
        if (result !== undefined) {
          this.creaRespuestaSC(idPreg, result.enunciado);
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
    if (result !== undefined){
      this.creaPreguntaSC(result.enunciado, result.recompensa);
      //this.insertaPregunta(result.enunciado, result.recompensa);
  }
  });
  }

////////////// revisar si usar ///
creaPregunta() {
  let novaPreg:any = { };
  this.service.creaPregunta(this.web3obj, this.wallet, novaPreg);
  } 
  
  
  
  async getLogPreguntaCreada(id_preg:any) {
   
    const ev = await this.contract.events.PreguntaCreada({
      filter: { _id_preg: id_preg }, fromBlock: 0});
    
    this.eventPreguntaCreada = ev.on("data", (event: any) => {
      //console.log("Data: ", event)
      this.getData(event);
    });
    this.eventPreguntaCreada = ev.on("error", (event: any) => {
      //console.log("Data: ", event)
      this.getData(event);
    });
  }
  async getData(datos:any) {
    console.log(datos.returnValues);
  }

  async getLogPreguntaAnulada(id_preg:any) {

    const ev = await this.contract.events.PreguntaAnulada({
      filter: { _id_preg: id_preg }, fromBlock: 0});
    
    this.eventPreguntaAnulada = ev.on("data", (event: any) => {
      //console.log("Data: ", event)
      this.getData(event);
    });
    this.eventPreguntaAnulada = ev.on("error", (event: any) => {
      //console.log("Data: ", event)
      this.getData(event);
    });
  }
  
  async getLogInicioVotacion(id_preg:any) {

    const ev = await this.contract.events.InicioVotacion({
      filter: { _id_preg: id_preg }, fromBlock: 0});
    
    this.eventInicioVotacion = ev.on("data", (event: any) => {
      //console.log("Data: ", event)
      this.getData(event);
    });
    this.eventInicioVotacion = ev.on("error", (event: any) => {
      //console.log("Data: ", event)
      this.getData(event);
    });
  }

  async getLogFinalVotacion(id_preg:any) {

    const ev = await this.contract.events.FinalVotacion({
      filter: { _id_preg: id_preg }, fromBlock: 0});
    
    this.eventFinalVotacion = ev.on("data", (event: any) => {
      //console.log("Data: ", event)
      this.getData(event);
    });
    this.eventFinalVotacion = ev.on("error", (event: any) => {
      //console.log("Data: ", event)
      this.getData(event);
    });
  }

  async actualizaListaPregs() {
    this.conPregsQuery();
}

async test(num:any,t:any,units:any) {
  //console.log("Web: ", this.web3);
  //console.log("Contract: ", this.contract);
  var rawData = {
      from: this.wallet.address, // admin (address generada con la semilla facilitada).
      to: this.contract_address,  
      value: 0,
      gasPrice: this.web3obj.utils.toHex(10000000000),
      gasLimit: this.web3obj.utils.toHex(1000000),
      nonce: await this.web3obj.eth.getTransactionCount(this.wallet.address),
      data: this.contract.methods.admCfgTiempoRespuesta(num,t,units).encodeABI()
    }
  //console.log(rawData);
  var signed: any;
    if (this.metamask) {
      this.web3obj.eth.sendTransaction(rawData).then(
        (receipt: any) => {
            this.lastTransaction = receipt;
          },
          (error: any) => {
              console.log(error)
          }
      );
     }
    else {
      signed = await this.web3obj.eth.accounts.signTransaction(rawData, this.wallet.privateKey.toString('hex'));
      this.web3obj.eth.sendSignedTransaction(signed.rawTransaction).then(
        (receipt: any) => {
          console.log("Receipt: ",receipt);
          },
        (error: any) => {
          console.log("Error 5000");
            console.log(error);
          }
      ); 
    }
}


  
  
} // end class

// 0xF562C02033DF4b174885D8c7678dC1489340F6d9