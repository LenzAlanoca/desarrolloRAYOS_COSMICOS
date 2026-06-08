import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detector-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detector-panel.component.html',
  styleUrls: ['./detector-panel.component.css']
})
export class DetectorPanelComponent implements OnInit {
  // Datos ficticios para la simulación inicial
  detectorInfo = {
    nombre: 'Detector de Muones UMSA',
    codigo: '0x2F1',
    estacion: 'Laboratorio Chacaltaya',
    estado: 'ONLINE',
    uptime: '12 días, 04:22:15'
  };

  metricasPrincipales = {
    tasaEventos: 154.8, // eventos por segundo
    totalEventos: 1284503,
    temperatura: 24.5,
    presion: 870.12,
    humedad: 42.5
  };

  canales = [
    { id: 1, nombre: 'Canal 1 (C1)', valor: 794, porcentaje: 75, estado: 'Estable' },
    { id: 2, nombre: 'Canal 2 (C2)', valor: 447, porcentaje: 42, estado: 'Estable' },
    { id: 3, nombre: 'Canal 3 (C3)', valor: 752, porcentaje: 71, estado: 'Alerta' }
  ];

  fechaActual: Date = new Date();

  constructor() {}

  ngOnInit(): void {
    // Aquí conectaremos los streams en el futuro
  }

  getFiguraTitle(index: number): string {
    const titles = [
      'Coincidencias (Col 0 y Col 2) vs Presión',
      'Coincidencia (Col 1) vs Presión',
      'Cuentas Brutas (Raw CH0) vs Presión',
      'Cuentas Brutas (Raw CH1) vs Presión',
      'Cuentas Brutas (Raw CH2) vs Presión'
    ];
    return titles[index - 1] || '';
  }
}