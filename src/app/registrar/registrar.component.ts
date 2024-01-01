import { Component, Inject, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { FormBuilder,FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { es } from '../idioma';
import detectEthereumProvider from '@metamask/detect-provider';

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, ReactiveFormsModule,
      MatButtonModule, MatTooltipModule, MatIconModule],
  templateUrl: './registrar.component.html',
  styleUrl: './registrar.component.scss'
})
export class RegistrarComponent {
  @Input()
  idiomaSel: any = es;

// Variables
  title = 'esbrina';
  loginForm: any;
  sendForm: any;
  encrypted: any;
  llavor: any;
  metamask: boolean = false;
  wallet: any = {
    privateKey: '',
    privateKeyHex:'',
    publicKey: '',
    address: ''
  };
  window: any;
  provider: any;

constructor(@Inject(DOCUMENT) private document: Document, private formBuilder: FormBuilder) {
    this.window = document.defaultView; 
    this.loginForm = formBuilder.group({
      userLogin: "",
      userPass:"",
      seeds: "",
      password: ""
    });
    this.sendForm = formBuilder.group({
      address: "",
      monto:"",
    });
    this.encrypted = window.localStorage.getItem('seeds');
  }


  async registrar(sendData: any) {
    
    this.provider = await detectEthereumProvider();
    if (this.provider) {
      console.log(this.provider);
      // From now on, this should always be true:
      // provider === window.ethereum
      if (this.provider == undefined || this.provider !== this.window.ethereum) {
        console.log('Please install MetaMask!');
        return;
      }
    }
    // Registrar usuario: user/pass i public key
  }
}
