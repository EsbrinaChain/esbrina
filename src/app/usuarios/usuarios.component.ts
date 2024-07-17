import { Component, Input, OnInit } from '@angular/core';
import { es, en, cat} from "../idioma";
import { PreguntaComponent } from "../pregunta/pregunta.component";

import { initializeApp } from "firebase/app";
import 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { JsonPipe } from '@angular/common'





@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
  
export class UsuariosComponent {

  @Input()
  idiomaSel: any;
  
  
  app: any;
  analytics: any;
  idiomes:any;
  idioma_seleccionat: any;
  db: any;
  listaUsuarios: any;
  listajson: any;

  constructor() {
    
    this.idiomes = ["es", "en", "cat"];
    this.idioma_seleccionat = this.idiomaSel;

  
}
  ngOnInit() {
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
    //this.db = getFirestore(this.app);
    this.db = getFirestore(this.app);
    this.analytics = getAnalytics(this.app);
  }

  

  async insertaUsuario() { // (3)
    await this.db.collection('Usuarios').add({
      aliase: "Chispas",
      app: "Perez Salas",
      existe: true,
      nom: "Manuel",
      reputacion: 0,
      vetado:false
    });
  }

  async conUsuarios() {
    const citiesCol = collection(this.db, '/Usuarios');
    const usSnapshot = await getDocs(citiesCol);
    this.listaUsuarios = usSnapshot.docs.map(doc => doc.data());
    console.log(this.listaUsuarios[0]);

  }


}