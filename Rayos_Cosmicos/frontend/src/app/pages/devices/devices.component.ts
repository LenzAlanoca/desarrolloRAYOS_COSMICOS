import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiLogsService } from '../../services/api-logs.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="devices">
      <h2>Dispositivos</h2>
      <div *ngIf="!devices">Cargando...</div>
      <ul *ngIf="devices">
        <li *ngFor="let d of devices">
          <strong>{{d.nombre}}</strong> — {{d.codigo}} 
          <a routerLink="/logs" class="btn">Ver Logs</a>
        </li>
      </ul>
    </div>
  `,
  styles: [`.devices { padding: 12px } .btn { margin-left:12px; padding:6px 10px; background:#0b79d0; color:#fff; border-radius:4px; text-decoration:none }`]
})
export class DevicesComponent implements OnInit {
  devices: any[] | null = null;
  constructor(private api: ApiLogsService) {}
  ngOnInit(): void {
    this.api.getAllLogs().subscribe({ next: (res: any) => { this.devices = [res.device]; }, error: () => { this.devices = []; } });
  }
}
