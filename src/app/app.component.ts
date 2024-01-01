import { Component, OnInit } from '@angular/core';
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
import { WalletInComponent } from "./wallet-in/wallet-in.component";
import { RegistrarComponent } from './registrar/registrar.component';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, FormsModule,
    MatSelectModule, MatFormFieldModule, MatToolbarModule,
    MatSidenavModule, MatIconModule, MatMenuModule, MatListModule,
    WalletInComponent, RegistrarComponent],
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
  loginShow = false;
  registrarShow = false;
  
  constructor() {
    this.selectedLevel = this.levels[0];
    this.idiomes = ["es", "en", "cat"];
    this.idioma_seleccionat = es;
    this.title = this.idioma_seleccionat.m1;
    this.subtitle = this.idioma_seleccionat.m2;
  }
  ngOnInit() {
    
  }

  toNumber(){
    this.levelNum = +this.levelNum;
    console.log(this.levelNum);
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

}


