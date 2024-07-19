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
    autor:"Bandido James",
    autor_address: "0xFFFED2345",
    creada: "19 de julio de 2024, 4:00:42 p.m. UTC+2",
    enunciado: "¿De qué color tienen los ojos los delfines del Mar Mediterráneo?",
    estado: "Activa",
    fecha_votacion: "26 de julio de 2024",
    recompensa: 10
  };
}

// 0xF562C02033DF4b174885D8c7678dC1489340F6d9