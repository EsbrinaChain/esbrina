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
  estado_actual:any;

  lastTransaction: any;
  
  idiomaSelPreg: any;
  app: any;
  db: any;
  listaResp: any;
  total_resp: any;

  // Event variables
  eventFinalVotacion: any;
  
  providerETH = 'https://sepolia.infura.io/v3/d09825f256ae4705a74fdee006040903';
  contract_address: any = "0x6C2446A9C9fBC15B1e7B590826E7E73Bf6c375b2";
  
   
  contract: any;
  //providerETH = 'http://127.0.0.1:7545/';
  //contract_address: any = "0x44391de588851cC9649c9ca8FBba1e74a3AE0843";
  

  constructor() {
    this.idiomaSelPreg = this.idiomaSel;
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
    this.contract = new this.web3obj.eth.Contract(ABI.default, this.contract_address);
    
  }
  
  ngAfterViewInit() {
    this.conRespPregQuery(this.id_preg);
    this.numActualResps();
  }

  async conRespPregQuery(id_preg: any) {
    const queryPregs = query(collection(this.db, '/Resps'), where("id_preg","==",id_preg), orderBy("id_resp","asc"));
    const usSnapshot = await getDocs(queryPregs);
    this.listaResp = usSnapshot.docs.map(doc => doc.data());
    
  }

  async numActualResps() {
    const queryResps = query(collection(this.db, '/Resps'));
    const usSnapshot = await getDocs(queryResps);
    if (usSnapshot.empty) this.total_resp = 0;
    else this.total_resp = usSnapshot.size;

    //console.log("Nº actual de respuestas",this.total_resp);
  }

  async insResp() {
    
    for(let i = 1; i<=resps.length; i++) {
      await setDoc(doc(this.db, "Resps", (i).toString()), resps[i-1]);
      console.log(i, resps[i]);
      }
  }

  async votarRespuestaSC(id_preg:any, id_resp:any) {
    //console.log("Parametros votacion: ", id_preg, id_resp);
    var rawData = {
      from: this.wallet.address, 
      to: this.contract_address,  
      value: 0,
      gasPrice: this.web3obj.utils.toHex(10000000000),
      gasLimit: this.web3obj.utils.toHex(1000000),
      nonce: await this.web3obj.eth.getTransactionCount(this.wallet.address),
      data: this.contract.methods.votarRespuesta(id_preg,id_resp).encodeABI()
    }
    //console.log(rawData);
    this.enviaTxFirmada(rawData,this.wallet.privateKey.toString('hex'));
    
  }

async enviaTxFirmada(rawData:any, privateK:any) {
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
      signed = await this.web3obj.eth.accounts.signTransaction(rawData, privateK);
      this.web3obj.eth.sendSignedTransaction(signed.rawTransaction).then(
          (receipt: any) => {
            this.lastTransaction = receipt;
          },
          (error: any) => {
              console.log(error)
          }
      ); 
    }
  }

async noEsAutorDeRespuestas(id_preg: any) {
  const autor_mail = window.localStorage.getItem("esbrinaUserMail");
  //console.log(autor_mail);
  const queryResps = query(collection(this.db, '/Resps'), where("id_preg", "==", Number(id_preg)), where("email", "==", autor_mail));
  const usSnapshot = await getDocs(queryResps);
  const llista_resp = usSnapshot.docs.map(doc => doc.data());
  if (llista_resp.length > 0) {
    return false;
  } else {
    return true;
  }
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
    
  const queryResps = query(collection(this.db, '/Resps'), where("id_preg","==",Number(id_preg)), where("id_resp","==",Number(id_resp)));
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
  }
  
}
  
  async selectVoto(id_preg:any, id_resp:any) {

    // No es autor de ninguna respuesta en la pregunta
    const noEsAutorResp = await this.noEsAutorDeRespuestas(id_preg);
    // No ha votado otras respuestas => solo puede votar 1 vez
    const noHaVotado = await this.sinVoto(id_preg);
    const estado_actual = await this.contract.methods.estadoPreg(id_preg).call();
    if(noEsAutorResp && noHaVotado && estado_actual=="Votando."){
        await this.updVotoBackend(id_preg, id_resp);
        await this.votarRespuestaSC(id_preg, id_resp);
        this.refresh.emit();
        this.getLogFinalVotacion(id_preg);  
    } else if(estado_actual=="Consulta.") {
        console.log("La pregunta", id_preg, " no está en estado 'votando'");
        this.updEstadoPregBackend(id_preg, "consulta");
        this.updRespGanadorasPreg(id_preg);
      
  }
    //console.log("noEsAutorResp: ", noEsAutorResp); //console.log("noHaVotado: ", noHaVotado);
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
      await setDoc(item, updData);
      console.log("La pregunta ", id_preg, " ha cambiado a estado", updData.estado);
      this.refresh.emit();
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
        ganadoras.push(respActual);
      }
    }
    
    console.log(ganadoras);
    
  }

  async getLogFinalVotacion(id_preg:any) {

    const ev = await this.contract.events.FinalVotacion({
      filter: { _id_preg: id_preg }, fromBlock: 0});
    
    this.eventFinalVotacion = ev.on("data", (event: any) => {
      console.log("Data: ", event)
      this.getData(event);
    });
    this.eventFinalVotacion = ev.on("error", (event: any) => {
      console.log("Data: ", event)
      this.getData(event);
    });
  }

  async getData(datos:any) {
    console.log(datos.returnValues);
  }
}
