import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiLogsService {
  http = inject(HttpClient);
  private base = '/api/logs';

  getAllLogs() {
    return this.http.get(`${this.base}`).pipe(
      catchError(err => {
        console.warn('ApiLogsService: proxy fallo, intentando backend directo', err?.status || err);
        return this.http.get(`http://127.0.0.1:3000${this.base}`);
      })
    );
  }

  getLogContent(fileName: string) {
    return this.http.get(`${this.base}/${encodeURIComponent(fileName)}`).pipe(
      catchError(err => this.http.get(`http://127.0.0.1:3000${this.base}/${encodeURIComponent(fileName)}`))
    );
  }

  getLogAggregates(fileName: string) {
    return this.http.get(`${this.base}/aggregate/${encodeURIComponent(fileName)}`).pipe(
      catchError(err => this.http.get(`http://127.0.0.1:3000${this.base}/aggregate/${encodeURIComponent(fileName)}`))
    );
  }

  getLogPivot(fileName: string) {
    return this.http.get(`${this.base}/pivot/${encodeURIComponent(fileName)}`).pipe(
      catchError(err => this.http.get(`http://127.0.0.1:3000${this.base}/pivot/${encodeURIComponent(fileName)}`))
    );
  }
}
