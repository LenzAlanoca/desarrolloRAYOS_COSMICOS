import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ApiAuthService {
  http = inject(HttpClient);
  private base = '/api/auth';

  login(correo: string, contrasena: string): Observable<any> {
    const body = { correo, contrasena };
    // Intentar ruta relativa (proxy). Si falla, reintentar hacia backend directo.
    console.log('ApiAuthService: login intento via proxy', `${this.base}/login`);
    return this.http.post(`${this.base}/login`, body).pipe(
      catchError((err) => {
        console.warn('ApiAuthService: proxy fallo, intentando backend directo', err?.status || err);
        // si falla con 404/ network, intentar backend directo
        return this.http.post(`http://127.0.0.1:3000${this.base}/login`, body).pipe(
          catchError(e => {
            console.error('ApiAuthService: backend directo fallo', e);
            return throwError(() => e);
          })
        );
      }),
      tap((res: any) => {
        if (res?.token) {
          console.log('ApiAuthService: token recibido, guardando en localStorage');
          localStorage.setItem('jwt', res.token);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('jwt');
  }

  getToken() {
    return localStorage.getItem('jwt');
  }
}
