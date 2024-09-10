import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MatDialogContent, MatDialogActions, MatDialogClose, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { initializeApp } from "firebase/app";
import 'firebase/firestore';
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, documentId} from 'firebase/firestore';
import { firebaseConfig } from '../firestore1';

@Component({
  selector: 'app-prestigio',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatDialogContent, MatDialogActions, MatFormFieldModule,
    MatButtonModule, MatDialogModule, MatInputModule,MatDialogClose, CommonModule],
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
      
      this.lista_prestigio = data.listaPrestigio; 
      this.wallet = data.wallet;
      console.log(this.lista_prestigio);

    }
  



  ngOnInit(): void {
    this.app = initializeApp(firebaseConfig);
    this.db = getFirestore(this.app);
  }

  confirmado() {
    this.dialog.close(this.data_user);
  }

}
