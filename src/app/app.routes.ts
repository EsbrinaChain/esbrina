import { Routes } from '@angular/router';
import { WalletInComponent } from "./wallet-in/wallet-in.component";
import { RegistrarComponent } from './registrar/registrar.component';
import { es } from './idioma';
import { PreguntaComponent } from './pregunta/pregunta.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
    {
    path: "registro",
    component: RegistrarComponent
    },
    {
    path: "wallet1",
    component: WalletInComponent
    },
    {
    path: "Preguntas",
    component: PreguntaComponent
    }
];


