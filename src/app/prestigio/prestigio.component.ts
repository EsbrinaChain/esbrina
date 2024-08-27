import { Component, Inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MatDialogContent, MatDialogActions, MatDialogClose, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { initializeApp } from "firebase/app";
import 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, documentId} from 'firebase/firestore';
import { addDoc, Timestamp, query, orderBy, where, and } from 'firebase/firestore';
import { ABI } from '../esbrinachain';
//import {firebaseConfig, providerETH, contract_address } from '../firestore1';
import {firebaseConfig, providerETH, contract_address } from '../firestore2';
import { createBrotliDecompress } from 'zlib';

@Component({
  selector: 'app-prestigio',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatDialogContent, MatDialogActions, MatFormFieldModule,
    MatButtonModule, MatDialogModule, MatInputModule,MatDialogClose],
  templateUrl: './prestigio.component.html',
  styleUrl: './prestigio.component.scss'
})
export class PrestigioComponent {

    
  data_user: any;
  lista_prestigio: any;
  app: any;
  db: any;
  web3: any;
  contract: any;
  wallet: any;


    constructor(private dialog: MatDialogRef<PrestigioComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
      
        this.data_user = data;
        this.app = initializeApp(firebaseConfig);
        this.db = getFirestore(this.app);
        this.wallet = data.wallet;
        this.web3 = data.web3;
        this.contract = new data.web3.eth.Contract(ABI.default, data.contract_address);
    
        console.log(this.wallet.address);

    }
  
  async muestra_reputacion() {
    const queryUsuarios = query(collection(this.db, '/Pregs'),orderBy('blockNumber','asc'),orderBy('transactionIndex','asc'));
    const usSnapshot = await getDocs(queryUsuarios);
    const lista_usuarios = usSnapshot.docs.map(doc => doc.data());
    const num_usuarios = usSnapshot.size;
    const total_usuarios = await this.contract.methods.total_usuarios().call();
    for (let i = 0; i < total_usuarios; i++){
      
    }
  }


  ngOnInit(): void {
    this.app = initializeApp(firebaseConfig);
    this.db = getFirestore(this.app);
    this.muestra_reputacion();

    
  }

confirmado() {
  this.dialog.close(this.data_user);
}

}
