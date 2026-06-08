import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiLogsService } from '../../services/api-logs.service';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit, OnDestroy {
  logsData: any = null;
  loading = false;
  selectedAggregate: any = null;
  sampleEvents: any[] = [];
  pivotRows: any[] = [];
  // Live aggregated events across all files (same format que 'Muestra')
  liveEvents: any[] = [];
  private allEs: EventSource | null = null;
  private es: EventSource | null = null;
  // Live file stream
  selectedLiveFile: string | null = null;
  liveLines: any[] = [];
  private liveEs: EventSource | null = null;
  // helpers for template
  getKeys(obj: any) {
    return obj ? Object.keys(obj) : [];
  }

  getEventKeys(event: any) {
    if (!event) return [];
    return Object.keys(event).filter(k => k !== 'linea');
  }

  constructor(private api: ApiLogsService) {}

  ngOnInit(): void {
    this.load();
    this.connectStream();
    this.connectAllStream();
  }

  load() {
    this.loading = true;
    this.api.getAllLogs().subscribe({
      next: (res: any) => {
        this.logsData = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando logs', err);
        this.loading = false;
      }
    });
  }

  viewAggregate(fileName: string) {
    this.selectedAggregate = null;
    this.api.getLogAggregates(fileName).subscribe({
      next: (res) => this.selectedAggregate = res,
      error: (err) => console.error('Error agregados', err)
    });
  }

  getMedidasKV(): { key: string; value: any }[] {
    if (!this.selectedAggregate?.medidas) return [];
    return Object.entries(this.selectedAggregate.medidas).map(([k, v]) => ({ key: k, value: v }));
  }

  // Safe accessor for template to avoid strict typing issues
  getKVValue(k: { key: string; value: any }, prop: string) {
    try {
      return k?.value ? k.value[prop] : null;
    } catch (e) {
      return null;
    }
  }

  viewSample(fileName: string) {
    this.sampleEvents = [];
    this.api.getLogContent(fileName).subscribe({
      next: (res: any) => this.sampleEvents = res.eventos || [],
      error: (err) => console.error('Error mostrando eventos', err)
    });
  }

  // Abrir visualización en tiempo real de un archivo
  openLive(fileName: string) {
    this.closeLive();
    this.selectedLiveFile = fileName;
    this.liveLines = [];
    // obtener snapshot inicial
    this.api.getLogContent(fileName).subscribe({
      next: (res: any) => {
        this.liveLines = res.eventos || [];
        // luego abrir SSE
        try {
          const url = `/api/logs/stream/${encodeURIComponent(fileName)}`;
          this.liveEs = new EventSource(url);
          this.liveEs.addEventListener('init', (ev: any) => {
            try {
              const arr = JSON.parse(ev.data || '[]');
              this.liveLines = arr || [];
            } catch (e) {}
          });
          this.liveEs.addEventListener('line', (ev: any) => {
            try {
              const obj = JSON.parse(ev.data);
              // añadir al inicio para mostrar lo más reciente arriba
              this.liveLines = [obj, ...this.liveLines].slice(0, 500);
            } catch (e) {}
          });
          this.liveEs.addEventListener('error', (ev: any) => {
            console.warn('Live stream error', ev);
          });
        } catch (e) {
          console.warn('No se puede abrir EventSource live', e);
        }
      },
      error: (err) => console.error('Error snapshot live', err)
    });
  }

  closeLive() {
    if (this.liveEs) {
      this.liveEs.close();
      this.liveEs = null;
    }
    this.selectedLiveFile = null;
    this.liveLines = [];
  }

  viewPivot(fileName: string) {
    this.pivotRows = [];
    this.api.getLogPivot(fileName).subscribe({
      next: (res: any) => this.pivotRows = res.medidas || [],
      error: (err) => console.error('Error pivot', err)
    });
  }

  connectStream() {
    try {
      const url = '/api/logs/stream';
      this.es = new EventSource(url);
      this.es.onmessage = (ev) => {
        // default message (if any)
        try {
          const d = JSON.parse(ev.data);
          this.handleNewLog(d);
        } catch (e) {
          // ignore
        }
      };
      this.es.addEventListener('newlog', (ev: any) => {
        try {
          const d = JSON.parse(ev.data);
          this.handleNewLog(d);
        } catch (e) {}
      });
      this.es.onerror = (err) => {
        console.warn('EventSource error', err);
      };
    } catch (e) {
      console.warn('SSE not available', e);
    }
  }

  connectAllStream() {
    try {
      const url = '/api/logs/stream/all';
      this.allEs = new EventSource(url);
      this.allEs.addEventListener('init', (ev: any) => {
        try {
          const arr = JSON.parse(ev.data || '[]');
          // arr es lista de eventos en formato {file, linea, ...}
          this.liveEvents = arr || [];
        } catch (e) {}
      });
      this.allEs.addEventListener('line', (ev: any) => {
        try {
          const payload = JSON.parse(ev.data);
          // payload es el evento con campos: file, linea, ...
          const evObj = payload;
          this.liveEvents = [evObj, ...this.liveEvents].slice(0, 500);
        } catch (e) {}
      });
      this.allEs.onerror = (err) => { console.warn('All EventSource error', err); };
    } catch (e) {
      console.warn('SSE all not available', e);
    }
  }

  handleNewLog(file: any) {
    if (!this.logsData) return;
    // mark as new for UI highlight
    const f = { ...file, isNew: true };
    this.logsData.archivosEnDetector = [f, ...(this.logsData.archivosEnDetector || [])];
    // remove isNew after 8s
    setTimeout(() => {
      const idx = (this.logsData.archivosEnDetector || []).findIndex((x: any) => x.nombre === f.nombre);
      if (idx >= 0) {
        this.logsData.archivosEnDetector[idx].isNew = false;
      }
    }, 8000);
  }

  ngOnDestroy(): void {
    if (this.es) {
      this.es.close();
      this.es = null;
    }
    this.closeLive();
    if (this.allEs) { this.allEs.close(); this.allEs = null; }
  }
}
