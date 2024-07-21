import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { es, en, cat } from "../idioma";
import {pregs} from "../db-pregs"
import { initializeApp } from "firebase/app";
import 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { addDoc, Timestamp, query, orderBy, where } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

@Component({
  selector: 'app-pregunta',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './pregunta.component.html',
  styleUrl: './pregunta.component.scss'
})
export class PreguntaComponent {

  @Input()
  idiomaSel: any = es;
  
  idiomaSelPreg: any;
  app: any;
  db: any;
  analytics: any;
  listaPregs: any;
  totalPregs: any;
  

  preg = {
    id_preg: 1,
    anulada: true,
    autor:"Bandido James",
    autor_address: "0xFFFED2345",
    creada: "19 de julio de 2024, 4:00:42 p.m. UTC+2",
    enunciado: "¿De qué color tienen los ojos los delfines del Mar Mediterráneo?",
    estado: "Activa",
    fecha_votacion: "26 de julio de 2024",
    recompensa: 10
  };

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
    this.analytics = getAnalytics(this.app);
  }
  
  ngAfterViewInit() {
    console.log("Lee todas las preguntas:");
    this.conPregsQuery();
  }
  
async conPregsQuery() {
    const queryPregs = query(collection(this.db, '/Pregs'),orderBy('idp','asc'));
    const usSnapshot = await getDocs(queryPregs);
    this.listaPregs = usSnapshot.docs.map(doc => doc.data());
    this.totalPregs = usSnapshot.size;
    console.log(this.listaPregs);

}

async insPregs() {
    for(let i = 0; i<pregs.length; i++)
      await setDoc(doc(this.db, "Pregs", (i + 1).toString()), pregs[i]);
      //console.log(i+1, pregs[i]);
  }

}
// 0xF562C02033DF4b174885D8c7678dC1489340F6d9