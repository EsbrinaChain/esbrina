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
import Web3 from 'web3';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogRef, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import {CdkTextareaAutosize, TextFieldModule} from '@angular/cdk/text-field';
import { ABI } from '../esbrinachain';
import { GetPregComponent } from '../get-preg/get-preg.component';
import { GetRespComponent } from '../get-resp/get-resp.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrestigioComponent } from '../prestigio/prestigio.component';
import {firebaseConfig, providerETH, contract_address } from '../firestore1';
//import {firebaseConfig, providerETH, contract_address } from '../firestore2';



@Component({
  selector: 'app-pregunta',
  standalone: true,
  imports: [MatButtonModule, RespuestaComponent,
    MatIconModule, TextFieldModule, CommonModule,
    GetPregComponent, MatSelectModule, MatFormFieldModule,
    MatListModule, FormsModule, ReactiveFormsModule],
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

  imgBote = "bote.gif";
  bote: any = 0;
  boteETH: any = 0;
  
  app: any;
  db: any;
  analytics: any;
  listaPregs: any;
  totalPregs: any = 0;
  listaUsuarios: any;
  totalUsuarios: any;
  
  web3: any;
  balanceWalletAddress: any;
  total_resp: any = 0;
  idPreg: any;
  lastTransaction: any;
  lista_usuarios: any;
  
  // Variable de S.C.
  tiempo_votacion_sc: any;
  tiempo_respuesta_sc: any;
  num_incr_recompensa_sc=3;
  cupo_respuestas_sc: any;
  tiempo_respuesta_convertido: any;
  datosActualizadosPregunta: any;
  //admin_address: any;
  
  provider: any;
  userDefined: any;
  contract: any;


  
  

  preg = {
    enunciado: "",
    recompensa: ""
  };

  dialogRef: any;
  dialogRefResp: any;
  datos: any;
   
  // Event variables

  eventPreguntaCreada: any;
  eventPreguntaAnulada: any;

  eventRespuestaCreada: any;
  eventRespuestaFueraDeTiempo: any;
  eventRespuestaFueraDeCupo: any;
  
  eventInicioVotacion: any;
  eventFinalVotacion: any;
  

  

  constructor(private matDialog: MatDialog) {
    
            
  }

 
  async linEstadoResp(id_preg:any,text:any,t:any,v:any) {
    const id = 'LineaEstado_' + id_preg.toString();
    let d = document.getElementById(id);
    if (d != undefined) {
      //d.style.backgroundColor = "black";
      //d.style.color ="red";
      d.style.visibility = v;
      d.innerText = text;
      console.log(d);
      this.espera(t);
    }
    console.log(id,text,d);
  }
  
  async linEstadoPreg(text: any, t: any, v: any) {
    const id = 'LineaEstado_1';
    let d = document.getElementById(id);
    if (d != undefined) {
      //d.style.backgroundColor = "black";
      //d.style.color ="red";
      d.style.visibility = v;
      d.innerText = text;
      console.log(id, text, d);
      await this.espera(t);
    }

   }

  async espera(secs:any) {
    const wait = (t: any) => new Promise((resolve, reject) => setTimeout(resolve, t));
    const myFunc = async () => { const wait2sec = await wait(secs) }
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

async validaWalletBackend(adr: any) {
  const email = window.localStorage.getItem('esbrinaUserMail');
  const queryUsuarios = query(collection(this.db, '/Usuarios'),where('email','==',email));
  const usSnapshot = await getDocs(queryUsuarios);
  const id = usSnapshot.docs.map(doc => doc.ref.id);
    const item = doc(this.db, "Usuarios", id[0]);
    let docSnap = await getDoc(item);
    let updData: any; 
    if (docSnap.exists()) {
      updData = docSnap.data();
      if (updData.wallet.length == 0) updData.wallet = adr;
      await setDoc(item, updData);
      console.log("User ", email, " ha actualizado su address a ", updData.wallet);
    }  
}

ngOnInit(): void {
      
  this.app = initializeApp(firebaseConfig);
  this.db = getFirestore(this.app);
  this.analytics = getAnalytics(this.app);
  this.web3 = this.web3obj;
  this.contract = new this.web3obj.eth.Contract(ABI.default, contract_address);
  this.consultaVariables();
  setInterval(() => { this.actualizaListaPregs(); }, 30000);
  this.getBote();
  this.validaWalletBackend(this.wallet.address);
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
  const queryPregs = query(collection(this.db, '/Pregs'),orderBy('blockNumber','asc'),orderBy('transactionIndex','asc'));
  const usSnapshot = await getDocs(queryPregs);
  this.listaPregs = usSnapshot.docs.map(doc => doc.data());
  this.totalPregs = usSnapshot.size;
  
  //console.log(this.listaPregs);

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
 
async getBote() {
  var valor = await this.web3obj.eth.getBalance(contract_address); 
  var valorEther = this.web3obj.utils.fromWei(valor, 'ether');
  this.bote = valor;
  this.boteETH = valorEther;
}

  
  async creaPreguntaSC(enunciado: any, recompensa: any) {
    const email = window.localStorage.getItem('esbrinaUserMail');
    const gasPrice = await this.web3obj.eth.getGasPrice();
    console.log("Gas Price: ", gasPrice);
    const gasEstimated = await this.contract.methods.creaPregunta(enunciado, email, email, email).estimateGas(
      {
        from: this.wallet.address,
        value: recompensa
      });
    console.log("Gas Estimated", gasEstimated);
    var rawData = {
      from: this.wallet.address, // admin (address generada con la semilla facilitada).
      to: contract_address,
      value: Number(recompensa),
      //gasPrice: this.web3obj.utils.toHex(10000000000),
      //gasLimit: this.web3obj.utils.toHex(10000000),
      gasPrice: gasPrice,
      gasLimit: gasEstimated,
      nonce: await this.web3obj.eth.getTransactionCount(this.wallet.address),
      data: this.contract.methods.creaPregunta(enunciado, email, email, email).encodeABI()
    }
    console.log(rawData);
    var signed: any;
    this.linEstadoPreg(this.idiomaSel.m57, 3000, 'visible');
    let receipt;
    try {
      if (this.metamask) {
        receipt = await this.web3obj.eth.sendTransaction(rawData);
      }
      else {
        signed = await this.web3obj.eth.accounts.signTransaction(rawData, this.wallet.privateKey.toString('hex'));
        receipt = await this.web3obj.eth.sendSignedTransaction(signed.rawTransaction);
      }
      console.log("Receipt: ", receipt);
      console.log("Logs[0].topics[1]", receipt.logs[0].topics[1]);
      const idp = this.web3obj.utils.hexToNumber(receipt.logs[0].topics[1]);
      this.linEstadoPreg(this.idiomaSel.m49, 3000, 'visible');
      this.insertaPregunta(idp, enunciado, recompensa, receipt.blockNumber, receipt.transactionIndex);
    }
 catch(error) {
    console.log(error);
    this.linEstadoPreg(this.idiomaSel.m50, 3000, 'visible');
    }
}
async insertaPregunta(idp:any, enunciado: any, recompensa: any, blockNumber:any, transactionIndex:any) {
  this.balanceWalletAddress = await this.getBalanceAddress(this.wallet.address);
  // Usando Ganache retorna el valor del balance de la cuenta en ETH cuando deberian ser wei.
  const recompensaETH = this.web3obj.utils.fromWei(recompensa,"ether");
  //console.log(this.balanceWalletAddress);
  //console.log("Recompensa: ", recompensa);
  //console.log("RecompensaETH: ", recompensaETH);
  if(recompensaETH < this.balanceWalletAddress){
    this.totalPregs++;
    const prg = {
        blockNumber: Number(blockNumber),
        transactionIndex: Number(transactionIndex),
        idp: Number(idp),
        anulada: false,
        autor: window.localStorage.getItem('esbrinaUserMail'),
        autor_address: this.wallet.address,
        creada: this.creaDate(new Date(new Date().getTime())),
        enunciado: enunciado,
        estado: "abierta",
        fecha_votacion: this.creaDate(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)),
        idioma: "es",
        recompensa: Number(recompensa),
        incRecompensa:this.num_incr_recompensa_sc,
        email: window.localStorage.getItem('esbrinaUserMail'),
      };
    console.log("Pregunta: ",prg,"Total Preguntas: ",this.totalPregs);
    await addDoc(collection(this.db, "Pregs"), prg);
    this.conPregsQuery();

  }
    
}
async updEstadoPregBackend(id_preg: any, estado_actual: any) {
    const queryPreg = query(collection(this.db, '/Pregs'), where("idp","==",Number(id_preg)));
    const usSnapshot = await getDocs(queryPreg);
    
    const id = usSnapshot.docs.map(doc => doc.ref.id);
    const item = doc(this.db, "Pregs", id[0]);
    let docSnap = await getDoc(item);
    let updData: any; 
    if (docSnap.exists()) {
      updData = docSnap.data();
      if (estado_actual == 'anulada') updData.anulada = true;
      updData.estado = estado_actual;
      await setDoc(item, updData);
      console.log("La pregunta ", id_preg, " ha cambiado a estado", updData.estado);
      this.conPregsQuery();
    }
  }
  async creaRespuestaSC(id_preg: any, enunciado_resp: any,blockNumber:any,transactionIndex:any) {
    const email = window.localStorage.getItem('esbrinaUserMail');
    let gasPrice;
    let gasEstimated;
    try {
      gasPrice = await this.web3obj.eth.getGasPrice();
    } catch (error) {
      this.linEstadoResp(id_preg, error, 2000, 'visible');
    }
    console.log("Gas Price: ", gasPrice);
    try {
      gasEstimated = await this.contract.methods.creaRespuesta(id_preg, enunciado_resp, email, email, email).
        estimateGas({ from: this.wallet.address });
    } catch (error) {
      this.linEstadoResp(id_preg, error, 2000, 'visible');
    }
    console.log("Gas Estimated",gasEstimated);
    var rawData = {
        from: this.wallet.address, // admin (address generada con la semilla facilitada).
        to: contract_address,  
        value: 0,
        gasPrice: this.web3obj.utils.toHex(gasPrice),
        gasLimit: this.web3obj.utils.toHex(gasEstimated),
        //gasPrice: this.web3obj.utils.toHex(BigInt(80000000000)),//50070176532n  46790342006n
        //gasLimit: this.web3obj.utils.toHex(1000000),
        nonce: await this.web3obj.eth.getTransactionCount(this.wallet.address),
        data: this.contract.methods.creaRespuesta(id_preg,enunciado_resp, email, email, email).encodeABI()
      }
    //console.log(rawData);
    var signed: any;
    let receipt;
    this.linEstadoResp(id_preg, this.idiomaSel.m48, 2000, 'visible');
    try {
      if (this.metamask) {
        receipt = await this.web3obj.eth.sendTransaction(rawData);
      }
      else {
        signed = await this.web3obj.eth.accounts.signTransaction(rawData, this.wallet.privateKey.toString('hex'));
        receipt = await this.web3obj.eth.sendSignedTransaction(signed.rawTransaction);
      }
      console.log("Receipt: ", receipt);
    } catch (error) {
      this.linEstadoResp(id_preg, error, 5000, 'visible');
    }
    const preg_estado = await this.contract.methods.estadoPreg(id_preg).call();
    console.log("preg_estado: ",preg_estado);
    if (preg_estado == "Abierta.") {
      const idResp = this.web3obj.utils.hexToNumber(receipt.logs[0].topics[2]);
      console.log("receipt.logs[0].topics[2]: ", receipt.logs[0].topics[2]);
      console.log("idResp: ", idResp);
      this.insertaRespuesta(idResp, id_preg, enunciado_resp, blockNumber, transactionIndex);
      this.linEstadoResp(id_preg, this.idiomaSel.m49, 5000, 'visible');
    }
    else if (preg_estado=="Votando.") {
      await this.updEstadoPregBackend(id_preg, "votando");
      this.linEstadoResp(id_preg, this.idiomaSel.m64, 5000, 'visible');
      console.log("Datos de pregunta actualizados en el backend: votando");
    }
    else if (preg_estado == "Anulada.") {
      await this.updEstadoPregBackend(id_preg, "anulada");
      this.linEstadoResp(id_preg, this.idiomaSel.m65, 5000, 'visible');
      console.log("Datos de pregunta actualizados en el backend: anulada");
    }
  }

  async insertaRespuesta(id_resp: any, idPreg: any, enunciado_resp: any,
                         blockNumber_preg: any, transactionIndex_preg: any) {

  const rsp = {
                email: window.localStorage.getItem('esbrinaUserMail'),
              id_resp: Number(id_resp),
          blockNumber: blockNumber_preg,
     transactionIndex: transactionIndex_preg,    
            enunciado: enunciado_resp,
             ganadora: false,
                votos: 0,
              anulada: false,
              id_preg: Number(idPreg),
        };
      //console.log("Respuesta introducida: ",rsp);
  const r = await addDoc(collection(this.db, "Resps"), rsp);
  
  this.conPregsQuery();
  }

  async haRespondido(id_preg: any) {
    // calcAdrRespuestasAPregunta responde true si el usr ha respondido ya esta pregunta
    const yaHaRespondidoAPreg = await this.contract.methods.calcAdrRespuestasAPregunta(id_preg,this.wallet.address).call();
    //console.log("Preg",id_preg," - yaHaRespondidoAPreg: ", yaHaRespondidoAPreg);
    return yaHaRespondidoAPreg;
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
  async updPregBackend(blockNumber:any,transactionIndex:any,id_preg: any, estado: any, rcp: any, f_vot: any) {
    const queryPregs = query(collection(this.db, '/Pregs'),
    where("blockNumber","==",blockNumber),where("transactionIndex","==",transactionIndex),
      orderBy('blockNumber', 'asc'), orderBy('transactionIndex', 'asc'));
    const usSnapshot = await getDocs(queryPregs);
    const id = usSnapshot.docs.map(doc => doc.ref.id);
    const item = doc(this.db, "Pregs", id[0]);
    let docSnap = await getDoc(item);
    
    const estado_txt = (estado == 0) ? "abierta" : (estado == 1) ? "votando" : (estado == 2) ? "consulta" : (estado == 3) ? "anulada" : undefined;
    
    if (docSnap.exists()) {
      let prg = docSnap.data();
      //console.log("prg antes: ", prg);
      prg['estado'] = estado_txt;
      prg['anulada'] = (estado == 3) ? true : false;
      prg['recompensa'] = Number(rcp);
      if (f_vot != 0) { prg['fecha_votacion'] = this.fechaUnixToDDMMAAAA(f_vot); }
      //console.log("prg después: ", prg);
      await setDoc(item, prg);
      this.conPregsQuery();
    } 
  }
  
async actualizaDatosPregSC(blockNumber: any, transactionIndex: any, id_preg: any) {
  try {
      this.datosActualizadosPregunta = await this.contract.methods.preguntas(Number(id_preg)).call();
      //console.log("Datos leidos pregunta: ",id_preg, this.datosActualizadosPregunta);
      const estado_blk = this.datosActualizadosPregunta.estado;
      const estado_txt = (estado_blk == 0) ? "abierta" : (estado_blk == 1)
                                           ? "votando" : (estado_blk == 2)
                                           ? "consulta" : (estado_blk == 3)
                                           ? "anulada" : undefined;
      this.listaPregs[id_preg - 1].estado = estado_txt;
      this.listaPregs[id_preg - 1].recompensa = this.datosActualizadosPregunta.recompensa;
      if (this.datosActualizadosPregunta.fecha_votacion != 0) {
        this.listaPregs[id_preg - 1].fecha_votacion = this.fechaUnixToDDMMAAAA(this.datosActualizadosPregunta.fecha_votacion);
      }
      await this.updPregBackend(blockNumber,transactionIndex,id_preg,
                          this.datosActualizadosPregunta.estado,
                          this.datosActualizadosPregunta.recompensa,
                          this.datosActualizadosPregunta.fecha_votacion);
  
  } catch (err) {
    console.log(err);
  }
}

  async dialogRespuesta(blockNumber:any,transactionIndex:any,idPreg: any, email: any) {
    this.actualizaDatosPregSC(blockNumber, transactionIndex, idPreg);
    const usarDialog = await this.haRespondido(idPreg);
    let noAutorPreg = false;
    const pregunta = await this.contract.methods.preguntas(idPreg).call();
    console.log("Autor pregunta en contrato (address): ", pregunta.autor.toLowerCase(),
      "\nUsuario (address)", this.wallet.address.toLowerCase());
    if (pregunta.autor.toLowerCase() != this.wallet.address.toLowerCase()) noAutorPreg = true;
    // console.log("usarDialog: ", usarDialog, "noAutor: ", noAutorPreg);
    const estado_actual = await this.contract.methods.estadoPreg(idPreg).call();
    //console.log("Estado_actual: ",estado_actual);
    if (!usarDialog && noAutorPreg && estado_actual=='Abierta.') {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = '70%';
      dialogConfig.autoFocus = true;
      dialogConfig.data = { enunciado: '' };
      this.dialogRefResp = this.matDialog.open(GetRespComponent, dialogConfig);
      this.datos = this.dialogRefResp.afterClosed().subscribe((result: any) => {
        if (result !== undefined) {
          this.creaRespuestaSC(idPreg, result.enunciado, blockNumber, transactionIndex);
        }
      });
    } else {
      if (usarDialog) {
        this.linEstadoResp(idPreg, this.idiomaSel.m51, 3000,'visible');
      }
      if (!noAutorPreg) this.linEstadoResp(idPreg, this.idiomaSel.m52, 3000,'visible');
      if (estado_actual!='Abierta.') this.linEstadoResp(idPreg, this.idiomaSel.m53, 3000,'visible');
      console.log("Ya se ha respondido la pregunta: ", usarDialog,
        "\nEs autor de la pregunta: ", !noAutorPreg,
        "\nSolo la combinación 'false', 'false' permite responder.",
        "\nEstado pregunta:", estado_actual);
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
  }
  });
  }

showDialogEstadisticas(){
  const stdWindow = new MatDialogConfig();
  stdWindow.width = '40%';
  stdWindow.autoFocus = true;
  stdWindow.data = {
    listaPrestigio: this.lista_usuarios,
    wallet:this.wallet.address,
  };
  this.dialogRef = this.matDialog.open(PrestigioComponent, stdWindow);
  this.datos = this.dialogRef.afterClosed().subscribe((result: any) => {
    if (result !== undefined){
      //
  }
  });
  }

  
  async pastEventsPreguntaCreada(event_name:any, autor:any, block:any) {
  
    const idp = await this.contract.getPastEvents(
      event_name,
      {
        filter: {
          
          _autor: autor
        },
        fromBlock: block,
        toBlock: block + BigInt(2)
      },
      function (error: any, events: any) { console.log(events); }).then(function (events: any) {
        console.log("Event PreguntaCreada: ",events);
        if (events.length > 0) {
          //console.log("Param: ", events[0].returnValues._id_preg);
          return events[0].returnValues._id_preg;
        } else {
          return events.length;
        }
      });
    
    return idp;
  }
  
  async pastEventsRespuestaCreada(event_name:any, id_preg:any, autor:any, block:any) {
  
    const respId = await this.contract.getPastEvents(
      event_name,
      {
        filter: {
          id_preg: id_preg,
          autor: autor
        },
        fromBlock: block,
        toBlock: block
      },
      function (error: any, events: any) { console.log(events); }).then(function (events: any) {
        console.log("Event RespuestaCreada: ",events);
        if (events.length > 0) {
          //console.log("Param: ", events[0].returnValues.id_resp);
          return events[0].returnValues.id_resp;
        } else {
          console.log("La respuesta es: ", events.length);
          return events.length;
        }
      });
    return respId;
  } 
  
  async getData(datos:any) {
    console.log(datos.returnValues);
  }


async actualizaListaPregs() {
  this.conPregsQuery();
  //this.consultaVariables();
  this.getBote();
}

async updGanadoraBackend(id_preg: any, id_resp: any, valor:any) {
  console.log("updGanadoraBackend: id_preg:",id_preg," id_res:", id_resp); 
  const queryResps = query(collection(this.db, '/Resps'),
    where("id_preg", "==", Number(id_preg)),
    where("id_resp", "==", Number(id_resp)));
  const usSnapshot = await getDocs(queryResps);
  const id = usSnapshot.docs.map(doc => doc.ref.id);
  const item = doc(this.db, "Resps", id[0]);
  let docSnap = await getDoc(item);
  let updData: any; 
  if (docSnap.exists()) {
    updData = docSnap.data();
    updData.ganadora = valor;
    console.log("updData: ", updData);
    await setDoc(item, updData);
    
  }
}  
  
  async updRespGanadorasPreg(id_preg: any) {

    const queryResps = query(collection(this.db, '/Resps'), where("id_preg", "==", id_preg), orderBy("id_resp", "asc"));
    const usSnapshot = await getDocs(queryResps);
    const numRespPreg = usSnapshot.size;
    let respActual: any;
    let ganadoras = [];
    for (let i = 1; i <= numRespPreg; i++){
      respActual = await this.contract.methods.preg_resp(id_preg, i).call();
      if (respActual.ganadora == true) {
        ganadoras.push(respActual.id_resp);
        await this.updGanadoraBackend(id_preg, respActual.id_resp, true);
      }
    }
    console.log("Respuesta/s ganadora/s",ganadoras);
    this.conPregsQuery();
    setTimeout(() => { }, 15000);
    for (let i = 0; i < ganadoras.length; i++){
        await this.updGanadoraBackend(id_preg, ganadoras[i], false);
      }

  }


  async pagoPorSolucion(id_preg: any) {
    const pregunta = await this.contract.methods.preguntas(id_preg).call();
    const valorPago = Math.round(Number(BigInt(pregunta.recompensa) / BigInt(2)));
    console.log("Valor Pago por consultar: ", valorPago);
    console.log("autor pregunta: ",pregunta.autor.toLowerCase(),"Autor consulta: ",this.wallet.address.toLowerCase())
    if (pregunta.autor.toLowerCase() != this.wallet.address.toLowerCase()){
      const gasPrice = await this.web3obj.eth.getGasPrice();
      console.log("Gas Price: ",gasPrice);
      const gasEstimated = await this.contract.methods.consultaRespuestaVotada(id_preg).estimateGas(
        {
          from: this.wallet.address,
          value: valorPago
         });
      console.log("Gas Estimated", gasEstimated);
      
        var rawData = {
          from: this.wallet.address, // admin (address generada con la semilla facilitada).
          to: contract_address,  
          value: valorPago,
          gasPrice: this.web3obj.utils.toHex(gasPrice),
          gasLimit: this.web3obj.utils.toHex(gasEstimated),
          //gasPrice: this.web3obj.utils.toHex(BigInt(80000000000)),//50070176532n  46790342006n
          //gasLimit: this.web3obj.utils.toHex(1000000),
          nonce: await this.web3obj.eth.getTransactionCount(this.wallet.address),
          data: this.contract.methods.consultaRespuestaVotada(id_preg).encodeABI()
        }
        //console.log(rawData);
        var signed: any;
        if (this.metamask) {
          this.web3obj.eth.sendTransaction(rawData).then(
            (receipt: any) => {
              console.log("Receipt-Consulta-Resposta + votada: ", receipt);
              this.linEstadoResp(id_preg,this.idiomaSel.m54,2000,'visible');
              this.updRespGanadorasPreg(id_preg);
              },
              (error: any) => {
                console.log("Error pago por consulta", error);
                this.linEstadoResp(id_preg,this.idiomaSel.m50,2000,'visible');
              }
          );
          }
        else {
          signed = await this.web3obj.eth.accounts.signTransaction(rawData, this.wallet.privateKey.toString('hex'));
          this.web3obj.eth.sendSignedTransaction(signed.rawTransaction).then(
            (receipt: any) => {
              console.log("Receipt-Consulta-Resposta + votada: ", receipt);
              this.linEstadoResp(id_preg,this.idiomaSel.m54,2000,'visible');
              this.updRespGanadorasPreg(id_preg);
              },
            (error: any) => {
              console.log("Error pago por consulta", error);
              this.linEstadoResp(id_preg,this.idiomaSel.m50,2000,'visible');
              }
          ); 
        }
      
    } else {
      await this.updRespGanadorasPreg(id_preg);
    }
}


async muestra_reputacion() {
    const queryUsuarios = query(collection(this.db, '/Usuarios'),orderBy('reputacion','asc'));
    const usSnapshot = await getDocs(queryUsuarios);
    let lista_usuarios = usSnapshot.docs.map(doc => doc.data());
    const num_usuarios = usSnapshot.size;
    
    for (let k = 0; k < num_usuarios; k++){
      console.log("K=", k, "    Wallet: ", lista_usuarios[k]['wallet']);
      const adr = lista_usuarios[k]['wallet'];
      const rpSC = await this.contract.methods.usuarios(adr).call();
      const id = usSnapshot.docs.map(doc => doc.ref.id);
      const item = doc(this.db, "Usuarios", id[k]);
      let docSnap = await getDoc(item);
      let updData: any; 
      if (docSnap.exists()) {
        updData = docSnap.data();
        updData.reputacion = Number(rpSC.prestigio);
        console.log("updData: ", updData);
        await setDoc(item, updData);
      }
    }
    const queryUsuarios1 = query(collection(this.db, '/Usuarios'),orderBy('reputacion','desc'));
    const usSnapshot1 = await getDocs(queryUsuarios1);
    this.lista_usuarios = usSnapshot1.docs.map(doc => doc.data());
    this.showDialogEstadisticas();

  }
  
async updRecompensaPreg(id_preg:any, recompensa:any) {
    const queryPreg = query(collection(this.db, '/Pregs'), where("idp","==",Number(id_preg)));
    const usSnapshot = await getDocs(queryPreg);
    
    const id = usSnapshot.docs.map(doc => doc.ref.id);
    const item = doc(this.db, "Pregs", id[0]);
    let docSnap = await getDoc(item);
    let updData: any; 
    if (docSnap.exists()) {
      updData = docSnap.data();
      updData.recompensa += recompensa;
      updData.incRecompensa -= 1;
      await setDoc(item, updData);
      console.log("La pregunta ", id_preg, " ha cambiado la recompensa a ", updData.recompensa);
      this.conPregsQuery();
    }
}
  
  
test_valor(txt:any) {
    const valor = Number(txt);
    if (isNaN(valor)) return 0;
    else return parseInt(txt);
    
  }
  async incrementaRecompensa(id_preg: any, incremento: any) {
  
    const valor = this.test_valor(incremento);
    console.log("pregunta:", id_preg, "Incrementar la recompensa en: ", valor);
    const pregunta = await this.contract.methods.preguntas(id_preg).call();
    if (pregunta.estado < 2) {
      this.linEstadoResp(id_preg, this.idiomaSel.m55, 2000, 'visible');
      const gasPrice = await this.web3obj.eth.getGasPrice();
      console.log("Gas Price: ", gasPrice); 
      const gasEstimated = await this.contract.methods.subirRecompensaPreg(id_preg).estimateGas(
        {
          from: this.wallet.address,
          value: valor
        });
      console.log("Gas Estimated", gasEstimated);
    
      var rawData = {
        from: this.wallet.address, // admin (address generada con la semilla facilitada).
        to: contract_address,
        value: valor,
        gasPrice: this.web3obj.utils.toHex(gasPrice),
        gasLimit: this.web3obj.utils.toHex(gasEstimated),
        nonce: await this.web3obj.eth.getTransactionCount(this.wallet.address),
        data: this.contract.methods.subirRecompensaPreg(id_preg).encodeABI()
      }
      //console.log(rawData);
      var signed: any;
      if (this.metamask) {
        this.web3obj.eth.sendTransaction(rawData).then(
          (receipt: any) => {
            console.log("Receipt-Subir recompensa: ", receipt);
            this.linEstadoResp(id_preg, this.idiomaSel.m55, 2000, 'visible');
            this.updRecompensaPreg(id_preg, valor);
          },
          (error: any) => {
            console.log("Error subida recompensa", error);
            this.linEstadoResp(id_preg, this.idiomaSel.m50, 2000, 'visible');
          }
        );
      }
      else {
        signed = await this.web3obj.eth.accounts.signTransaction(rawData, this.wallet.privateKey.toString('hex'));
        this.web3obj.eth.sendSignedTransaction(signed.rawTransaction).then(
          (receipt: any) => {
            console.log("Receipt-Subir recompensa: ", receipt);
            this.linEstadoResp(id_preg, this.idiomaSel.m55, 2000, 'visible');
            this.updRecompensaPreg(id_preg, valor);
          },
          (error: any) => {
            console.log("Error subida recompensa", error);
            this.linEstadoResp(id_preg, this.idiomaSel.m50, 2000, 'visible');
          }
        );
      }
    
    } else {
      console.log(this.idiomaSel.m56);
      this.linEstadoResp(id_preg, this.idiomaSel.m56, 2000, 'visible');
    }
  }  
  async notificacio(id_preg: any, miss: any) {
    await this.linEstadoResp(id_preg, miss, 5000, 'visible');
  }
} // end class

// 0xF562C02033DF4b174885D8c7678dC1489340F6d9