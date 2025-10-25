import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MessageService } from '../message/message.service';
import { Shift } from '../../interfaces/shift';

@Injectable({
  providedIn: 'root'
})
export class ShiftService {
  private baseUrl = 'http://localhost:3000/shifts';

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) { }

  // obter todos os turnos
  getAllShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(this.baseUrl).pipe(
      tap(_ => this.log('fetched all shifts')),
      catchError(this.handleError<Shift[]>('getAllShifts', []))
    );
  }

  getShiftById(shiftId: string): Observable<Shift | undefined> {
    return this.http.get<Shift>(`${this.baseUrl}/shift/${shiftId}`).pipe(
      tap(_ => this.log(`fetched shift id=${shiftId}`)),
      catchError(this.handleError<Shift>(`getShiftById id=${shiftId}`))
    );
  }

  // buscar turnos de um motorista especifico
  getShiftsByDriver(driverId: string): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${this.baseUrl}/driver/${driverId}`).pipe(
      tap(_ => this.log(`fetched shifts for driver id=${driverId}`)),
      catchError(this.handleError<Shift[]>(`getShiftsByDriver id=${driverId}`, []))
    );
  }

  // buscar turno ativo de um motorista especifico
  getActiveShiftByDriver(driverId: string): Observable<Shift | null> {
    return this.http.get<Shift>(`${this.baseUrl}/driver/active-shift/${driverId}`).pipe(
      tap(_ => this.log(`fetched active shift for driver id=${driverId}`)),
      catchError(error => {
        if (error.status === 404) {
          this.log(`no active shift for driver id=${driverId}`);
          return of(null);
        } else {
          return this.handleError<Shift | null>(`getActiveShiftByDriver id=${driverId}`, null)(error);
        }
      })
    );
  }

  getShiftsByTaxi(taxiId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/by-taxi/${taxiId}`);
  }

  // obter taxis disponiveis durante um periodo
  getAvailableTaxis(start: Date, end: Date): Observable<any[]> {
    const body = {
      timePeriod: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    };
    return this.http.post<any[]>(`${this.baseUrl}/taxis`, body).pipe(
      tap(_ => this.log(`fetched available taxis for period`)),
      catchError(this.handleError<any[]>(`getAvailableTaxis`, []))
    );
  }

  // criar um novo turno para um motorista
  createShift(driverId: string, shift: Shift): Observable<Shift> {
    // Prepara o payload apenas com os IDs
    const shiftData = {
      driver: shift.driver,
      taxi: shift.taxi._id,
      timePeriod: {
        start: shift.timePeriod.start,
        end: shift.timePeriod.end
      }
    };

    return this.http.post<Shift>(`${this.baseUrl}`, shiftData)
      .pipe(
        tap((newShift: Shift) => this.log(`created shift for driver id=${driverId}`)),
        catchError(error => {
          this.log(`createShift failed: ${error.message}`);
          return of(error as any);
        })
      );
  }

  private log(message: string) {
    this.messageService.add(`ShiftService: ${message}`);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
