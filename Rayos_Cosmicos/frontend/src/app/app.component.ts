import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend-app';
  constructor() {
    // Si la app se está sirviendo en el puerto 4200 (vieja instancia), redirigir al puerto de desarrollo único
    try {
      if (typeof window !== 'undefined' && window.location && window.location.port === '4200') {
        const targetPort = '61913';
        const url = `${window.location.protocol}//${window.location.hostname}:${targetPort}${window.location.pathname}${window.location.search}`;
        window.location.replace(url);
      }
    } catch (e) {
      // silencioso
    }
  }
}
