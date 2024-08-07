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
import { UsuariosComponent } from "../usuarios/usuarios.component";
import { PreguntaComponent } from "../pregunta/pregunta.component";
import { ABI } from '../esbrinachain';

import Web3  from 'web3';

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, ReactiveFormsModule,
    MatButtonModule, MatTooltipModule, MatIconModule, UsuariosComponent, PreguntaComponent],
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
    privateKeyHex: '',
    publicKey: '',
    address: ''
  };
  
  window: any;
  provider: any;
  accounts: any;
  blockNumber: any;
  balanceWalletAddress: any;
  web3: any;
  userDefined: any;
  contract: any;
  contract_address:any = "0x195DC1E0844d87b76FbFC0162BC1e1050c19C38d";


  constructor(@Inject(DOCUMENT) private document: Document, private formBuilder: FormBuilder) {
    this.window = document.defaultView;
    this.loginForm = formBuilder.group({
      userLogin: "",
      userPass: "",
      seeds: "",
      password: ""
    });
    this.sendForm = formBuilder.group({
      address: "",
      monto: "",
    });
    this.encrypted = window.localStorage.getItem('seeds');
    this.miraSiEsbrinaUser();
    
  }


  miraSiEsbrinaUser() {
    if (this.window.localStorage.getItem('esbrinaUser') != null) {
      this.userDefined = true;
    }
    else {
      this.userDefined = false;
    }
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
  }

  
  async getBlockN() {
    this.blockNumber = await this.window.ethereum.request({ method: 'eth_blockNumber' });
    console.log("Block Number: ",this.blockNumber);
  }

  async getBalanceAddress(address: any) {
    var valor = await this.window.ethereum.request({ method: 'eth_getBalance', params: [address] });
    var valorEther = Web3.utils.fromWei(valor, 'ether');
    this.balanceWalletAddress = valorEther;
    console.log("Balance (ETH): ", this.balanceWalletAddress);
  }

  async loginMetamask() {
    //console.log("METAMASK");
    this.provider = await detectEthereumProvider();
    if (this.provider) {
      console.log(this.provider);
      // From now on, this should always be true:
      // provider === window.ethereum
      if (this.provider == undefined || this.provider !== this.window.ethereum) {
        console.log('Please install MetaMask!');
        return;
      }
      //console.log("LLEGA");
      this.accounts = await this.window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log("All accounts: ", this.accounts);
      this.wallet.address = this.accounts[0];
      console.log("Wallet:",this.wallet.address);
      this.getBlockN();
      this.getBalanceAddress(this.wallet.address);
      this.web3 = new Web3(this.window.ethereum);
      this.metamask = true;
      this.contract = new this.web3.eth.Contract(ABI.default, this.contract_address);
    }
  }
}
