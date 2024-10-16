import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterOutlet, RouterLink, RouterModule } from '@angular/router';
import { FormBuilder,FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { PreguntaComponent } from "./pregunta/pregunta.component";
import * as CryptoJS from 'crypto-js';
import { initializeApp } from "firebase/app";
import 'firebase/firestore';
import { getFirestore, collection, getDocs, doc, setDoc, addDoc, Timestamp,query, where, deleteDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import {firebaseConfig } from './firestore1';




@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterModule,FormsModule,ReactiveFormsModule, 
    MatSelectModule, MatFormFieldModule, MatToolbarModule,
    MatSidenavModule, MatIconModule, MatMenuModule, MatListModule,
    WalletInComponent, RegistrarComponent, PreguntaComponent],
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
  regUser = true;
  imgLogoFile: string = "Logo-3.png";
  window: any;
  esbrinaUser: string="";
  esbrinaUserMail: any;
  resultado_insert: any;

  @ViewChild(WalletInComponent)
  WalletIn: WalletInComponent | undefined;

  walletAddr: any;
  encryptedVar: any;
  userDefined: any;
  usuarioRegistrado: any;
  listaUsuarios: any;
  totalUsuarios: any;
  emailIncorrecte = false;
  app: any;
  db: any;
  regForm: any;
 
  constructor(@Inject(DOCUMENT) private document: Document, private formBuilder: FormBuilder) {
    this.window = document.defaultView;
    this.regForm = formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      password: "",
      alias: ""
    });
    this.selectedLevel = this.levels[0];
    this.idiomes = ["es", "en", "cat"];
    this.idioma_seleccionat = es;
    this.title = this.idioma_seleccionat.m1;
    this.subtitle = this.idioma_seleccionat.m2;
    this.getVarsWalletIn();
    //console.log("altaUser: ",this.UsuariosEsb?.altaUser);
    
  }
  
  ngOnInit() {
        
    this.app = initializeApp(firebaseConfig);
    this.db = getFirestore(this.app);
    
    this.esbrinaUser = this.window.localStorage.getItem('esbrinaUser');
    this.esbrinaUserMail=this.window.localStorage.getItem('esbrinaUserMail');
    this.compruebaBackendUserActivo(this.esbrinaUserMail);
    
    //console.log("UserDefined: ",this.userDefined);
    this.totalUsuarios = this.conTotalUsuarios();
    this.miraSiEsbrinaUser();
    console.log("userDefined: ", this.userDefined);
    this.resultado_insert = "";
  }

  async compruebaBackendUserActivo(email: any) {
    const queryUsuarios = query(collection(this.db, '/Usuarios'),where("email","==",email));
    const usSnapshot = await getDocs(queryUsuarios);
    const existe = usSnapshot.docs.length;

    if (existe == 0)
    {
      this.userDefined = false;
      this.regUser = true;
      window.localStorage.removeItem('esbrinaUser');
      window.localStorage.removeItem('esbrinaUserMail');
      window.localStorage.removeItem('seeds');
    }
    else {
      this.userDefined = true; this.regUser = false;
    }
    
  }

  async insertaUsuarioID(email: any, pass: any, alias: any) {
    const queryUsuarios = query(collection(this.db, '/Usuarios'),where("email","==",email));
    const usSnapshot = await getDocs(queryUsuarios);
    const existe = usSnapshot.docs.length;
    this.resultado_insert = "";
    if (!this.userDefined && existe == 0) {
      this.totalUsuarios++;
        
      const usuario = {
        id: this.totalUsuarios,
        wallet: "",
        aliase: alias,
        email: email,
        existe: true,
        psw: pass,
        reputacion: 0,
        vetado: false,
        creado: Timestamp.fromDate(new Date())
      }
      await addDoc(collection(this.db, "Usuarios"), usuario);
      this.window.localStorage.setItem('esbrinaUser', CryptoJS.AES.encrypt(email, pass));
      this.window.localStorage.setItem('esbrinaUserMail', email);
      this.userDefined = true;
      this.regUser = false;
    }
    else {
      console.log("El usuario ", email, " ya existe.");
      this.resultado_insert = "El usuario '" + email +"' ya existe en el sistema. Por favor, utilice otra dirección de correo electrónico.";
    }
  }

  async sendRegistro(sendData: any) {
    
    this.insertaUsuarioID(sendData.email, sendData.password, sendData.alias);
    
  }

  async conTotalUsuarios() {
    const numUsuarios = collection(this.db, '/Usuarios');
    const usSnapshot = await getDocs(numUsuarios);
    this.totalUsuarios = usSnapshot.docs.length;
    console.log(this.totalUsuarios);

  }

    /*insUsuario(email:any, password:any) {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        this.userCred = userCredential 
        this.user = userCredential.user;
        console.log(this.userCred,this.user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode,errorMessage);
        // ..
      });
  }*/

  signOutUsuario() {
    const auth = getAuth();
    signOut(auth).then(() => {
      // Sign-out successful.
    }).catch((error) => {
      // An error happened.
    });
  }

  neteja() {
    this.resultado_insert = "";
  }

  testEmail() {
    
    if (this.regForm.status == "INVALID") {
      this.emailIncorrecte = true;
    }
    else {
      this.emailIncorrecte = false;
    }
  }

  miraSiEsbrinaUser() {
    if (this.window.localStorage.getItem('esbrinaUser') != null) {
      this.userDefined = true;
      this.regUser = false;
    }
    else {
      this.userDefined = false;
      this.regUser = true;
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
    const q = query(usuariosRef, where("email", "==",this.esbrinaUserMail));
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
      this.window.localStorage.removeItem("seeds");
      this.userDefined = false;
      this.regUser = true;
      this.totalUsuarios-=1;
    }
}
    
}


