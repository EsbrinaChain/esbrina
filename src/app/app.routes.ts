import { Routes } from '@angular/router';
import { WalletInComponent } from "./wallet-in/wallet-in.component";
import { RegistrarComponent } from './registrar/registrar.component';
import { es } from './idioma';

export const routes: Routes = [
    {
    path: "registro",
    component: RegistrarComponent
    },
    {
    path: "wallet1",
    component: WalletInComponent
    }
];


