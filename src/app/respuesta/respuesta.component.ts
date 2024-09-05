import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { es, en, cat } from "../idioma";
import {resps} from "../db-resps"
import { initializeApp } from "firebase/app";
import 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, getDoc, doc, setDoc } from 'firebase/firestore';
import { addDoc, Timestamp, query, orderBy, where } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { ABI } from '../esbrinachain';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {firebaseConfig, providerETH, contract_address } from '../firestore1';
//import {firebaseConfig,providerETH, contract_address } from '../firestore2';



@Component({
  selector: 'app-respuesta',
  standalone: true,
  imports: [MatButtonModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './respuesta.component.html',
  styleUrl: './respuesta.component.scss'
})
export class RespuestaComponent {

  @Output()
  refresh = new EventEmitter<void>();  
  
  @Output()
  notifica = new EventEmitter<string>();

  @Input()
  idiomaSel: any = es;
  
  @Input({required: true})
  id_preg: any;
   
  @Input()
  web3obj: any;
  @Input()
  wallet: any;
  @Input()
  metamask: any;
  @Input()
  estado_actual: any;
  @Input()
  blockNumber: any;
  @Input()
  transactionIndex: any;

  lastTransaction: any;
  
  app: any;
  db: any;
  listaResp: any;
  total_resp: any;
  contract: any;

  // Event variables
  eventFinalVotacion: any;
  

  constructor() {
    
  }

  ngOnInit(): void {
        
    this.app = initializeApp(firebaseConfig);
    this.db = getFirestore(this.app);
    this.contract = new this.web3obj.eth.Contract(ABI.default, contract_address);
    
  }
  
  ngAfterViewInit() {
    this.conRespPregQuery(this.blockNumber, this.transactionIndex);
    //console.log(this.blockNumber, this.transactionIndex);
    
  }

  async conRespPregQuery(blockNumber: any, transactionIndex:any) {
    const queryPregs = query(collection(this.db, '/Resps'), where("blockNumber", "==", Number(blockNumber)),
      where("transactionIndex", "==", Number(transactionIndex)), orderBy("id_resp", "asc"));
    const usSnapshot = await getDocs(queryPregs);
    this.listaResp = usSnapshot.docs.map(doc => doc.data());
    //console.log(this.listaResp);
    
  }

  async votarRespuestaSC(id_preg:any, id_resp:any) {
    //console.log("Parametros votacion: ", id_preg, id_resp);
    const gasPriceResp = await this.web3obj.eth.getGasPrice();
    this.notifica.emit(this.idiomaSel.m58 + gasPriceResp.toString());
    console.log("Gas Price: ",gasPriceResp);
    const gasEstimatedResp = await this.contract.methods.
      votarRespuesta(id_preg, id_resp).estimateGas({ from: this.wallet.address });
    console.log("Gas Estimated", gasEstimatedResp);
    this.notifica.emit(this.idiomaSel.m58 + gasEstimatedResp.toString());
      var rawData = {
        from: this.wallet.address, 
        to: contract_address,  
        value: 0,
        gasPrice: this.web3obj.utils.toHex(BigInt(80000000000)),
        gasLimit: this.web3obj.utils.toHex(1000000),
        nonce: await this.web3obj.eth.getTransactionCount(this.wallet.address),
        data: this.contract.methods.votarRespuesta(id_preg,id_resp).encodeABI()
      }
    //console.log(rawData);
    let receipt;
    var signed: any;
    try{
        this.notifica.emit(this.idiomaSel.m60);
        if (this.metamask) {
          receipt = await this.web3obj.eth.sendTransaction(rawData);
         }
        else {
          signed = await this.web3obj.eth.accounts.signTransaction(rawData,
                   this.wallet.privateKey.toString('hex'));
          receipt = await this.web3obj.eth.sendSignedTransaction(signed.rawTransaction);
        }
        console.log("Receipt: ", receipt);
        if (receipt.logs.length == 0) {
          await this.updVotoBackend(id_preg, id_resp);
          this.notifica.emit(this.idiomaSel.m63);
        }
        else if (receipt.logs.length == 3) {
          console.log("Se ha intentado votar y la pregunta ha cambiado ha estado 'consulta'");
          await this.updEstadoPregBackend(id_preg, "consulta");
          this.notifica.emit(this.idiomaSel.m61);
        }
        else if (receipt.logs.length == 2) {
          await this.updEstadoPregBackend(id_preg, "anulada");
          this.notifica.emit(this.idiomaSel.m62);
        }
      
    }catch (error) {
      console.log(error);
      this.notifica.emit(this.idiomaSel.m50);
    }
    this.refresh.emit();
  }

async haRespondido(id_preg: any) {
    // calcAdrRespuestasAPregunta responde true si el usr ha respondido ya esta pregunta
    const yaHaRespondidoAPreg = await this.contract.methods.calcAdrRespuestasAPregunta(id_preg,this.wallet.address).call();
    //console.log("Preg",id_preg," - yaHaRespondidoAPreg: ", yaHaRespondidoAPreg);
    return yaHaRespondidoAPreg;
}
  
  async sinVoto(id_preg: any) {
    const autor_addr = this.wallet.address; 
    const votado = await this.contract.methods.votaciones(autor_addr, id_preg).call();
    if (votado == 0) {
      return true; 
    } else {
      return false;
    } 
  } 
async updVotoBackend(id_preg: any, id_resp: any) {
  console.log("updVotoBackend: id_preg:",id_preg," id_resp:", id_resp); 
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
    updData.votos += 1;
    console.log("updData: ", updData);
    await setDoc(item, updData);
    this.refresh.emit();
  }
}
  
async selectVoto(id_preg: any, id_resp: any) {
    let noAutorPreg = false;
    const pregunta = await this.contract.methods.preguntas(id_preg).call();
    if (pregunta.autor.toLowerCase() != this.wallet.address.toLowerCase())
      noAutorPreg = true;
    console.log("Pregunta a Votar: ",pregunta);
    // No es autor de ninguna respuesta en la pregunta
    const EsAutorResp = await this.haRespondido(id_preg);
    console.log("EsAutorResp: ",EsAutorResp);
    // No ha votado otras respuestas => solo puede votar 1 vez
    const noHaVotado = await this.sinVoto(id_preg);
    console.log("noHaVotado: ",noHaVotado);
    const estado_actual_preg = await this.contract.methods.estadoPreg(id_preg).call();
    console.log("estado_actual: ",pregunta.estado,"=",estado_actual_preg);
    if (!EsAutorResp && noHaVotado && noAutorPreg && pregunta.estado == 1) {
        console.log("Votando por la resp ", id_resp, " de la pregunta ", id_preg);
        await this.votarRespuestaSC(id_preg, id_resp);
        this.refresh.emit();
    } else if (pregunta.estado == 1 && (EsAutorResp || !noHaVotado || !noAutorPreg)) {
      console.log("La pregunta", id_preg,
                  " está en estado 'votando', pero este usuario no puede votarla.");
      if (!noAutorPreg) this.notifica.emit(this.idiomaSel.m66);
      if (EsAutorResp) this.notifica.emit(this.idiomaSel.m67);
      if (!noHaVotado) this.notifica.emit(this.idiomaSel.m68);
    } else if(estado_actual_preg=="Consulta.") {
      console.log("La pregunta", id_preg,
                  " no está en estado 'votando' sino en estado de '",
        estado_actual_preg, "'");
        this.estado_actual = "consulta"; 
      this.updEstadoPregBackend(id_preg, "consulta");
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
      updData.estado = estado_actual;
      if(estado_actual == 'anulada') updData.anulada = true;
      await setDoc(item, updData);
      console.log("La pregunta ", id_preg, " ha cambiado a estado", updData.estado);
      this.refresh.emit();
    }
  }


async pastEventsFinalVotacion(event_name:any, id_preg:any, autor:any, block:any) {
  
    const respWin = await this.contract.getPastEvents(
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
        console.log(events);
        if (events.length > 0) {
          return events[0].returnValues.respGanadora;
        } else {
          return events.length;
        }
      });
    
    return respWin;
  } 


}
