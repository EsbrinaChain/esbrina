import { Routes } from '@angular/router';
import { WalletInComponent } from "./wallet-in/wallet-in.component";
import { AppComponent } from './app.component';
import { RegistrarComponent } from './registrar/registrar.component';

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


