import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="home">
      <h2>Rayos Cósmicos — Portal</h2>
      <p>Bienvenido al portal de visualización de datos del detector.</p>
      <div class="menu">
        <a routerLink="/devices" class="btn">Dispositivos</a>
        <a routerLink="/logs" class="btn">Ver Logs</a>
        <a routerLink="/about" class="btn">Acerca de</a>
        <a routerLink="/login" class="btn">Login</a>
      </div>
    </div>
  `,
  styles: [`
    .home { padding: 16px }
    .menu { display:flex; gap:8px; margin-top:12px }
    .btn { padding:8px 12px; background:#1976d2; color:#fff; border-radius:6px; text-decoration:none }
  `]
})
export class HomeComponent {}
