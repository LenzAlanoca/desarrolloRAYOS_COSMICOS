import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div style="padding:12px">
      <h2>Acerca de</h2>
      <p>Proyecto de monitorización de rayos cósmicos. Interfaz mínima: páginas públicas, vistas de logs en tiempo real y dashboards por rol.</p>
    </div>
  `
})
export class AboutComponent {}
