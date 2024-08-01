import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { es, en, cat} from "./idioma";
import {MatSelectModule} from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {MatListModule} from '@angular/material/list';
import { WalletInComponent } from './wallet-in/wallet-in.component';
import { RegistrarComponent } from './registrar/registrar.component';
import { UsuariosComponent } from "./usuarios/usuarios.component";
import { PreguntaComponent } from "./pregunta/pregunta.component";
import { DOCUMENT } from '@angular/common';
import { initializeApp } from "firebase/app";
import 'firebase/firestore';
import { getFirestore, collection, getDocs, doc, setDoc, addDoc, Timestamp,query, where, deleteDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, FormsModule,
    MatSelectModule, MatFormFieldModule, MatToolbarModule,
    MatSidenavModule, MatIconModule, MatMenuModule, MatListModule,
    WalletInComponent, RegistrarComponent, UsuariosComponent, PreguntaComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
  
export class AppComponent implements OnInit{

  levelNum:number=0;
  levels = [ 
      {num: 0, name: "ES"},
      {num: 1, name: "EN"},
      {num: 2, name: "CAT"}
  ];
  selectedLevel:any;
  idiomes:any;
  idioma_seleccionat:any;
  title:any;
  subtitle: any;
  loginShow = true;
  registrarShow = false;
  regUser = false;
  imgLogoFile: string = "Logo-3.png";
  window: any;
  esbrinaUser: string="";
  esbrinaUserMail: any;

  @ViewChild(WalletInComponent)
  WalletIn: WalletInComponent | undefined;

  @ViewChild(UsuariosComponent)
  UsuariosEsb: UsuariosComponent | undefined;

  walletAddr: any;
  encryptedVar: any;
  userDefined: any;

  app: any;
  db: any;
  listaUsuarios: any;
 

  
  constructor(@Inject(DOCUMENT) private document: Document) {
    this.window = document.defaultView;
    this.selectedLevel = this.levels[0];
    this.idiomes = ["es", "en", "cat"];
    this.idioma_seleccionat = es;
    this.title = this.idioma_seleccionat.m1;
    this.subtitle = this.idioma_seleccionat.m2;
    this.getVarsWalletIn();
    //console.log("altaUser: ",this.UsuariosEsb?.altaUser);
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
    this.db = getFirestore(this.app);
    
    this.esbrinaUser = this.window.localStorage.getItem('esbrinaUser');
    
    if (this.esbrinaUser == null)
    { this.userDefined = false; this.regUser = true; }
    else {
      this.userDefined = true; this.regUser = false;
    }
    this.esbrinaUserMail=this.window.localStorage.getItem('esbrinaUserMail');
    //console.log("UserDefined: ",this.userDefined);
  }

  miraSiEsbrinaUser() {
    if (this.window.localStorage.getItem('esbrinaUser') != null) {
      this.userDefined = true;
    }
    else {
      this.userDefined = false;
    }
  }

  toNumber(){
    this.levelNum = +this.levelNum;
    //console.log(this.levelNum);
    if (this.levelNum==0){
      this.idioma_seleccionat = es;
      this.title = this.idioma_seleccionat.m1;
      this.subtitle = this.idioma_seleccionat.m2;
    }
    else if(this.levelNum==1){
      this.idioma_seleccionat = en;
      this.title = this.idioma_seleccionat.m1;
      this.subtitle = this.idioma_seleccionat.m2;
    }
    else{
      this.idioma_seleccionat = cat;
      this.title = this.idioma_seleccionat.m1;
      this.subtitle = this.idioma_seleccionat.m2;
    }
  }

  getVarsWalletIn(){
      this.encryptedVar = this.WalletIn?.encrypted;
      this.walletAddr = this.WalletIn?.wallet;
  }

  async buscaUsuarioAlta() {
    const usuariosRef = collection(this.db, "Usuarios");
    const q = query(usuariosRef, where("email", "==",this.esbrinaUserMail.toString()));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) console.log("no results");
    this.listaUsuarios = querySnapshot.docs.map(doc => doc.data());
    const dc = querySnapshot.docs.map;
    console.log("USER:",dc);
  }
  async eliminarCuenta() {
    const usuariosRef = collection(this.db, "Usuarios");
    const q = query(usuariosRef, where("email", "==",this.esbrinaUserMail.toString()));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) { console.log("no results"); }
    else {
            querySnapshot.forEach((doc) => {
                                              console.log(doc.id, " => ", doc.data());
                                              deleteDoc(doc.ref);
                                            }
      );
      this.window.localStorage.removeItem("esbrinaUser");
      this.window.localStorage.removeItem("esbrinaUserMail");
  }
}
    
}


