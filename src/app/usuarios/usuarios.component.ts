import { Component, Input } from '@angular/core';
import { es, en, cat} from "../idioma";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";


@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
  
export class UsuariosComponent {

  @Input()
  idiomaSel: any = es;
  
  firebaseConfig = {
    apiKey: "AIzaSyAHz9zSUk258f3CyoMA2cvE8Kf2BnF442c",
    authDomain: "esbrinachain-777.firebaseapp.com",
    projectId: "esbrinachain-777",
    storageBucket: "esbrinachain-777.appspot.com",
    messagingSenderId: "825098637790",
    appId: "1:825098637790:web:1c3930b7e4033004c70d4f",
    measurementId: "G-Y0VFSVPTBC"
  };
  app: any;
  analytics: any;
  idiomes:any;
  idioma_seleccionat:any;

  constructor() {
    // Initialize Firebase
    this.app = initializeApp(this.firebaseConfig);
    this.analytics = getAnalytics(this.app);
    this.idiomes = ["es", "en", "cat"];
    this.idioma_seleccionat = es;
  
}

}
