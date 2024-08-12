import { Component, Inject, Input, OnInit } from '@angular/core';
import { es, en, cat} from "../idioma";
import { FormBuilder,FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { initializeApp } from "firebase/app";
import 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, doc, setDoc, addDoc, Timestamp } from 'firebase/firestore';
//import 'firebaseui/dist/firebaseui.css'
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import * as CryptoJS from 'crypto-js';
import { PreguntaComponent } from "../pregunta/pregunta.component";
import { WalletInComponent } from '../wallet-in/wallet-in.component';
import { RegistrarComponent } from '../registrar/registrar.component';




@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, PreguntaComponent, WalletInComponent, RegistrarComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})

export class UsuariosComponent {

  @Input()
  idiomaSel: any = es;
    
  window: any;
  app: any;
  analytics: any;
  idioma_seleccionat: any;
  db: any;
  listaUsuarios: any;
  totalUsuarios: any;
  listajson: any;
  regForm: any;
  userCred: any;
  user: any;
  emailIncorrecte = false;
  altaUser: boolean = false;
  
    

  constructor(@Inject(DOCUMENT) private document: Document,
    private formBuilder: FormBuilder) {
    this.window = document.defaultView;
    this.idioma_seleccionat = this.idiomaSel;
    this.regForm = formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      password: "",
      alias: ""
    });
    console.log(this.regForm);
    
  
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
    this.analytics = getAnalytics(this.app);
    this.totalUsuarios = this.conTotalUsuarios();
    this.miraSiEsbrinaUser();
    console.log(this.altaUser);
  }

  miraSiEsbrinaUser() {    
    if (this.window.localStorage.getItem('esbrinaUser') != null) {
      this.altaUser = true;
    }
    else {
      this.altaUser = false;
    }
  }

  async conUsuarios() {
    const numUsuarios = collection(this.db, '/Usuarios');
    const usSnapshot = await getDocs(numUsuarios);
    this.listaUsuarios = usSnapshot.docs.map(doc => doc.data());
    this.totalUsuarios = this.listaUsuarios.length;
    console.log(this.listaUsuarios[0]);

  }
  async insertaUsuarioID(email: any, pass: any, alias: any) {
    if(!this.altaUser){
        await setDoc(doc(this.db, "Usuarios", (this.totalUsuarios + 1).toString()),
          {
            aliase: alias,
            email: email,
            existe: true,
            psw: pass,
            reputacion: 0,
            vetado: false,
            creado: Timestamp.fromDate(new Date())
          });
      this.window.localStorage.setItem('esbrinaUser', CryptoJS.AES.encrypt(email, pass));
      this.window.localStorage.setItem('esbrinaUserMail', email);
      this.altaUser = true;
      
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

  insUsuario(email:any, password:any) {
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
  }

  signOutUsuario() {
    const auth = getAuth();
    signOut(auth).then(() => {
      // Sign-out successful.
    }).catch((error) => {
      // An error happened.
    });
  }

  testEmail() {
    if (this.regForm.status == "INVALID") {
      this.emailIncorrecte = true;
    }
    else {
      this.emailIncorrecte = false;
    }
  }


}