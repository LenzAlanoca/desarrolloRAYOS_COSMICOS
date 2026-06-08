import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables, zoomPlugin);

@Component({
  selector: 'app-detector-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detector-panel.component.html',
  styleUrls: ['./detector-panel.component.css']
})
export class DetectorPanelComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('chartCanvas') chartCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  
  private charts: Chart[] = [];
  private eventSource: EventSource | null = null;
  private maxDataPoints = 100; // Historial configurable

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

  fechaActual: Date = new Date();
  selectedFile: string = 'Esperando stream...';

  constructor(private zone: NgZone) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Retardo mínimo para asegurar que el DOM y los canvas estén listos
    setTimeout(() => {
      this.initCharts();
      this.connectToStream();
    }, 100);
  }

  private connectToStream() {
    this.eventSource = new EventSource('/api/logs/stream/all');

    // Escuchar el estado inicial (últimos puntos registrados)
    this.eventSource.addEventListener('init', (event: any) => {
      this.zone.run(() => {
        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data)) {
            // Invertimos para que el tiempo fluya de izquierda a derecha
            data.reverse().forEach(record => this.addDataPoint(record));
          }
        } catch (e) {
          console.error('Error parseando init data', e);
        }
      });
    });

    // Escuchar nuevos puntos en tiempo real
    this.eventSource.addEventListener('line', (event: any) => {
      this.zone.run(() => {
        const data = JSON.parse(event.data);
        this.selectedFile = data.file;
        this.addDataPoint(data);
      });
    });

    this.eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      this.detectorInfo.estado = 'OFFLINE';
    };
  }

  private initCharts() {
    const commonOptions: any = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: { 
          type: 'time', 
          time: { unit: 'second' }, 
          grid: { color: '#f0f0f0' }, 
          ticks: { display: false } // Quita las etiquetas de hora del eje X
        },
        y: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { font: { size: 12 } } }
      },
      interaction: {
        mode: 'index',
        intersect: false, // Permite ver el dato sin tocar exactamente la línea
      },
      plugins: {
        zoom: { zoom: { wheel: { enabled: true }, mode: 'x' }, pan: { enabled: true, mode: 'x' } },
        legend: { display: true, labels: { boxWidth: 15, font: { size: 13 } } },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 10,
          cornerRadius: 6,
          displayColors: true
        }
      },
      elements: {
        line: { tension: 0.2 }, // Suaviza un poco la línea
        point: { radius: 0, hitRadius: 10, hoverRadius: 5 } // Oculta puntos, pero detecta el mouse cerca
      }
    };

    const config: ChartConfiguration[] = [
      { type: 'line', data: { datasets: [{ label: 'CH0&CH1', data: [], borderColor: 'blue', borderWidth: 2, pointRadius: 0 }, { label: 'CH1&CH2', data: [], borderColor: 'teal', borderWidth: 2, pointRadius: 0 }] }, options: { ...commonOptions, plugins: { ...commonOptions.plugins, title: { display: true, text: 'Coincidencias (Cuentas/min)', font: { size: 16 } } } } },
      { type: 'line', data: { datasets: [{ label: 'CH0&CH2', data: [], borderColor: 'orange', borderWidth: 2, pointRadius: 0 }] }, options: { ...commonOptions, plugins: { ...commonOptions.plugins, title: { display: true, text: 'Coincidencias (CH0&CH2)', font: { size: 16 } } } } },
      { type: 'line', data: { datasets: [{ label: 'Raw CH0', data: [], borderColor: 'red', borderWidth: 2, pointRadius: 0 }] }, options: { ...commonOptions, plugins: { ...commonOptions.plugins, title: { display: true, text: 'Cuentas Brutas CH0', font: { size: 16 } } } } },
      { type: 'line', data: { datasets: [{ label: 'Raw CH1', data: [], borderColor: 'green', borderWidth: 2, pointRadius: 0 }] }, options: { ...commonOptions, plugins: { ...commonOptions.plugins, title: { display: true, text: 'Cuentas Brutas CH1', font: { size: 16 } } } } },
      { type: 'line', data: { datasets: [{ label: 'Raw CH2', data: [], borderColor: 'purple', borderWidth: 2, pointRadius: 0 }] }, options: { ...commonOptions, plugins: { ...commonOptions.plugins, title: { display: true, text: 'Cuentas Brutas CH2', font: { size: 16 } } } } }
    ];

    this.chartCanvases.forEach((canvas, idx) => {
      this.charts.push(new Chart(canvas.nativeElement, config[idx]));
    });
  }

  private addDataPoint(record: any) {
    // Validar timestamp
    const timestampStr = record.timestamp || record.Timestamp;
    const t = new Date(timestampStr);
    if (isNaN(t.getTime())) return;

    this.fechaActual = t;
    const now = t.getTime();
    const timeWindow = now - (10 * 60 * 1000); // Ventana de 10 minutos para datos más densos

    // Mapeo robusto: intenta colX y también nombres de BDD por si acaso
    const getV = (r: any, col: string, alt: string) => {
      const val = r[col] !== undefined ? r[col] : r[alt];
      return val !== undefined ? Number(val) : 0;
    };

    const mappings = [
      [getV(record, 'col0', 'canal_1'), getV(record, 'col2', 'canal_3')], 
      [getV(record, 'col1', 'canal_2')],
      [getV(record, 'col4', 'temp_ext')],
      [getV(record, 'col5', 'presion')],
      [getV(record, 'col6', 'humedad')]
    ];

    this.charts.forEach((chart, idx) => {
      mappings[idx].forEach((val, datasetIdx) => {
        chart.data.datasets[datasetIdx].data.push({ x: t as any, y: val });
        if (chart.data.datasets[datasetIdx].data.length > this.maxDataPoints) {
          chart.data.datasets[datasetIdx].data.shift();
        }
      });

      // Fijar el rango visible a exactamente los últimos 10 minutos
      if (chart.options.scales && chart.options.scales['x']) {
        chart.options.scales['x'].min = timeWindow;
        chart.options.scales['x'].max = now;
      }

      chart.update('none'); // Update sin animaciones para mayor eficiencia
    });

    // Actualizar métricas principales
    this.metricasPrincipales.tasaEventos = record.col0; 
    this.metricasPrincipales.totalEventos += 1;
  }

  ngOnDestroy(): void {
    if (this.eventSource) this.eventSource.close();
    this.charts.forEach(c => c.destroy());
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