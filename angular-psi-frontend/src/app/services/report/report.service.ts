import { Injectable } from '@angular/core';
import { ReportTotals, ReportSubtotals, DriverSubtotals, TaxiSubtotals } from '../../interfaces/report';
import { TimePeriod } from '../../interfaces/timePeriod';
import { Observable, of, throwError } from 'rxjs';
import { MessageService } from '../message/message.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private messageService: MessageService,
    private http: HttpClient) { }

  private reportsUrl = 'http://localhost:3000/reports';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  /**mensagens de MessageService relacionadas a ReportService*/
  private log(message: string) {
    this.messageService.add(`ReportService: ${message}`);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);

      return of(result as T);
    };
  }

  // funcao auxiliar para montar os parametros do pedido
  private buildTimePeriodParams(timePeriod?: TimePeriod): HttpParams {
    let params = new HttpParams();
    if (timePeriod?.start) {
      params = params.set('start', timePeriod.start.toISOString());
    }
    if (timePeriod?.end) {
      params = params.set('end', timePeriod.end.toISOString());
    }
    return params;
  }

  // obter report basico de um dado periodo (ou hoje por omissao)
  getReportTotals(timePeriod?: TimePeriod): Observable<ReportTotals> {
    const params = this.buildTimePeriodParams(timePeriod);
    return this.http.get<ReportTotals>(`${this.reportsUrl}/totals`, { params }).pipe(
      tap(() => this.log('Fetched totals')),
      catchError(this.handleError<ReportTotals>('getTotals'))
    );
  }

  // obter report mais detalhado de um dado periodo (ou hoje por omissao)
  getReportSubtotals(timePeriod?: TimePeriod): Observable<ReportSubtotals> {
    const params = this.buildTimePeriodParams(timePeriod);
    return this.http.get<ReportSubtotals>(`${this.reportsUrl}/subtotals`, { params }).pipe(
      tap(() => this.log('Fetched subtotals')),
      catchError(this.handleError<ReportSubtotals>('getSubtotals'))
    );
  }

  // obter report mais detalhado de um dado motorista
  getDriverSubtotals(driverId: string, timePeriod?: TimePeriod): Observable<DriverSubtotals> {
    const params = this.buildTimePeriodParams(timePeriod);
    return this.http.get<DriverSubtotals>(`${this.reportsUrl}/subtotals/driver/${driverId}`, { params }).pipe(
      tap(() => this.log(`Fetched driver subtotals for driver ${driverId}`)),
      catchError(this.handleError<DriverSubtotals>('getDriverSubtotals'))
    );
  }

  // obter report mais detalhado de um dado taxi
  getTaxiSubtotals(taxiId: string, timePeriod?: TimePeriod): Observable<TaxiSubtotals> {
    const params = this.buildTimePeriodParams(timePeriod);
    return this.http.get<TaxiSubtotals>(`${this.reportsUrl}/subtotals/taxi/${taxiId}`, { params }).pipe(
      tap(() => this.log(`Fetched taxi subtotals for taxi ${taxiId}`)),
      catchError(this.handleError<TaxiSubtotals>('getTaxiSubtotals'))
    );
  }
}