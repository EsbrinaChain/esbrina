import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormBuilder,FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PreguntaComponent } from "../pregunta/pregunta.component";


// Librerias de Ethereum y DApp
import * as Mnemonic from 'bitcore-mnemonic';
import { hdkey } from 'ethereumjs-wallet';
import * as bip39 from 'bip39';
import * as util from '@ethereumjs/util';
import Web3  from 'web3';
import * as CryptoJS from 'crypto-js';
import { es } from '../idioma';



  @Component({
  selector: 'app-wallet-in',
  standalone: true,
    imports: [CommonModule, RouterOutlet, FormsModule, ReactiveFormsModule,
      MatButtonModule, MatTooltipModule, MatIconModule, PreguntaComponent],
  templateUrl: './wallet-in.component.html',
  styleUrl: './wallet-in.component.scss'
})

export class WalletInComponent {
  @Input()
  idiomaSel: any=es;
      
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
    accounts: any
    blockNumber: any;
    balanceWalletAddress: any;
    web3: any;
    provider: any;
    
      
  constructor(@Inject(DOCUMENT) private document: Document, private formBuilder: FormBuilder) {
    this.window = document.defaultView; 
    this.loginForm = formBuilder.group({
      userSeed: "",
      password: ""
    });
    this.sendForm = formBuilder.group({
      address: "",
      monto:"",
    });
    this.encrypted = window.localStorage.getItem('seeds');
    
  }

    async sendLogin(sendData: any) {
    if (!this.encrypted) {
      //const mnemonic1 = bip39.generateMnemonic(); // genera la semilla automaticamente
      const mnemonic1 = sendData.userSeed;
      //console.log('Semilla enviada:', mnemonic1);
    if (!sendData.password) {
      return alert("El password de usuario es obligatorio.");
    }
    //if (!Mnemonic.isValid(sendData.seeds)) {
    //  return alert("Semilla invalida.");
    //}
    this.encrypted = CryptoJS.AES.encrypt(mnemonic1, sendData.password);
    window.localStorage.setItem('seeds', this.encrypted.toString());
    //console.log(sendData,this.encrypted.toString());
   }
    if (!sendData.password) {
      return alert("El password es obligatorio.");
    }
    this.llavor = CryptoJS.AES.decrypt(this.encrypted.toString(), sendData.password).toString(CryptoJS.enc.Utf8);
    if (!this.llavor) { return alert("Password incorrecto!"); }

    var keys = await this.initWallet(this.llavor).then((valor) => { return valor; });

    this.wallet.privateKey = keys.privateKey;
    this.wallet.privateKeyHex = util.bytesToHex(keys.privateKey);
    this.wallet.publicKey = keys.publicKey;
    this.wallet.address = keys.address;
    console.log(this.wallet.address);
    this.metamask = false;
    
    this.web3 = new Web3('https://sepolia.infura.io/v3/d09825f256ae4705a74fdee006040903');      
    this.web3.eth.defaultAccount = this.wallet.address;
    var n = await this.web3.eth.getBalance(this.wallet.address);
    console.log("BALANCE (wei): ", n);
    console.log("BlockNumber: ", await this.getBlockN());
    console.log("Balance: ",await this.getBalanceAddress(this.wallet.address));
    
  }
  
  async initWallet(seeds: String) {
    var mnemonic = new Mnemonic(seeds);

    var seed = await bip39.mnemonicToSeed(mnemonic.toString());
    var path = "m/44'/60'/0'/0/0";

    var wallet = hdkey.fromMasterSeed(seed).derivePath(path).getWallet();

    var privateKey = wallet.getPrivateKey();
    var publicKey = util.privateToPublic(privateKey);

    var address = util.bytesToHex(util.pubToAddress(publicKey));

    return { // da problemas si devolvemos convertido a hex
        privateKey: privateKey,
        publicKey: util.bytesToHex(publicKey),
        address: address
    };
    
  }  
  
    async getBlockN() {
      this.blockNumber = await this.web3.eth.getBlockNumber();
      return this.blockNumber;
  }

  async getBalanceAddress(address:any) {
    var valor = await this.web3.eth.getBalance(address); 
    var valorEther = this.web3.utils.fromWei(valor, 'ether');
    this.balanceWalletAddress = valorEther;
    return valorEther;
  }

  async sendTx0(sendTxData: any) {
  var params = [
		{
			"from": this.wallet.address,
			"to": sendTxData.address,
			"gas": Number(21000).toString(16),
			"gasPrice": Number(179000000).toString(16),
			"value": Number(sendTxData.monto).toString(16),
		}
  ];
    console.log(params);
    
  }

  async enviaTx(rawData: any) {
    // Minimos campos de Tx si la firmamos.
    let tx2 = {
      from: this.wallet.address,
      to: rawData.address,
      value: Web3.utils.toWei('1', 'ether'),
      gasPrice: await this.web3.eth.getGasPrice(),
    };
    console.log("ENVIA: Tx i PvKey: ", tx2, this.wallet.privateKey); 
    if (!this.metamask) {
      var signed = await this.web3.eth.accounts.signTransaction(tx2, this.wallet.privateKey);
      console.log("Signed:", signed);
      let txHash = await this.web3.eth.sendSignedTransaction(signed.rawTransaction);
      console.log("No Metamask (txHash.transactionHash): ", txHash.transactionHash);
      var tx2Receipt = await this.web3.eth.getTransactionReceipt(txHash.transactionHash);
    }
    else {
      let tx2 = {
        from: this.accounts[0],
        to: this.accounts[1],
        value: this.web3.utils.toWei('1', 'ether'),
        gasPrice: await this.web3.eth.getGasPrice(),
        nonce: Number(19).toString(16),
      };
      var params = [
        {
          "from": this.accounts[0],
          "to": this.accounts[1],
          "gas": Number(21000).toString(16),
          "gasPrice": Number(179000000).toString(16),
          "value": Number(1000000000000000000).toString(16),
        }
      ];
      let txHash = await this.window.ethereum.request({ method: "eth_sendTransaction", params });//.catch((err) => { console.log(err);  });
      console.log("Metamask: ", txHash);
      var tx2Receipt = await this.web3.eth.getTransactionReceipt(txHash);
    }
    console.log("Receipt: ",tx2Receipt);
}

  async sendTxWallet(rawData: any) {
    var tx1 = [{
      from: this.wallet.address,
      to: rawData.address,
      value: Web3.utils.numberToHex(Web3.utils.toWei(rawData.monto, 'ether')),
    }];
    console.log("Wallet= ", this.wallet);
    
    var signed = await this.web3.eth.accounts.signTransaction(tx1, this.wallet.privateKey.toString('hex'));
    console.log("Signed: ",signed)
    var res = await this.web3.eth.sendSignedTransaction(signed.rawTransaction);//.then((receipt: any) => { return receipt; }, (error: any) => { console.log(error) });
    console.log("TxHash: ", res);
  }

  async sendTx(sendTxData: any) {
    console.log("sendTx:",sendTxData);
    var args = [{
      from: this.wallet.address,
      to: sendTxData.address,
      value: Web3.utils.numberToHex(Web3.utils.toWei(sendTxData.monto, 'ether')),
    }];
    
    var tx = await this.window.ethereum.request({ method: 'eth_sendTransaction', params: args });
    console.log("Tx=", tx);
  }
  ngOnInit() {
    
  }
}
