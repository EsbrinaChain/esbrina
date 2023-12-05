import { Injectable } from '@angular/core';
// Librerias Ethereum
import * as Mnemonic from 'bitcore-mnemonic';
import { hdkey } from 'ethereumjs-wallet';
import * as bip39 from 'bip39';
import * as util from '@ethereumjs/util';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  constructor() { }

  async initWallet(seeds:string) {
    var mnemonic = new Mnemonic(seeds);

    var seed = await bip39.mnemonicToSeed(mnemonic.toString());
    var path = "m/44'/60'/0'/0/0";

    var wallet = hdkey.fromMasterSeed(seed).derivePath(path).getWallet();

    var privateKey = wallet.getPrivateKey();
    var publicKey = util.privateToPublic(privateKey);

    var address = util.bytesToHex(util.pubToAddress(publicKey));
    
    //console.log("Private:", privateKey.toString('hex'), "Public:", publicKey, "Address:", address);
    

    return {
        privateKey: privateKey.toString('hex'),
        publicKey: publicKey,
        address: address
    };
  }

}


