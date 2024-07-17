import { Component } from '@angular/core';

@Component({
  selector: 'app-pregunta',
  standalone: true,
  imports: [],
  templateUrl: './pregunta.component.html',
  styleUrl: './pregunta.component.scss'
})
export class PreguntaComponent {
  preg = {
    id_preg: 1,
    anulada: true,
    autor: "0xF562C02033DF4b174885D8c7678dC1489340F6d9",
    creada: true,
    enunciado: "¿De qué color tienen los ojos los delfines?",
    estado: "Activa",
    fecha_votacion: "",
    recompensa: 10
  };
}
