import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { es, en, cat } from "../idioma";
import {resps} from "../db-resps"
import { initializeApp } from "firebase/app";
import 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { addDoc, Timestamp, query, orderBy, where } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";



@Component({
  selector: 'app-respuesta',
  standalone: true,
  imports: [MatButtonModule, CommonModule],
  templateUrl: './respuesta.component.html',
  styleUrl: './respuesta.component.scss'
})
export class RespuestaComponent {

  @Input()
  idiomaSel: any = es;
  
  @Input({required: true})
  id_preg: any;
   
  
  idiomaSelPreg: any;
  app: any;
  db: any;
  listaResp: any;
  total_resp: any;

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


}
