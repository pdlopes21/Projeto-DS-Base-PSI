import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TaxiOrder } from '../../interfaces/taxiOrder';
import { MessageService } from '../message/message.service';

@Injectable({
  providedIn: 'root'
})
export class TaxiOrderService {
  private baseUrl = 'http://localhost:3000/taxiOrders';

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) { }

  // obter todos os pedidos
  getAllTaxiOrders(): Observable<TaxiOrder[]> {
    return this.http.get<TaxiOrder[]>(this.baseUrl).pipe(
      tap(_ => this.log('fetched all taxiOrders')),
      catchError(this.handleError<TaxiOrder[]>('getAllTaxiOrders', []))
    );
  }

  // obter todos os pedidos pendentes
  getPendingTaxiOrders(): Observable<TaxiOrder[]> {
    return this.http.get<TaxiOrder[]>(`${this.baseUrl}/pending`).pipe(
      tap(_ => this.log('fetched pending taxiOrders')),
      catchError(this.handleError<TaxiOrder[]>('getPendingTaxiOrders', []))
    );
  }

  // obter pedidos pendentes visiveis para o motorista
  getPendingTaxiOrdersForDriver(driverId: string): Observable<TaxiOrder[]> {
    return this.http.get<TaxiOrder[]>(`${this.baseUrl}/pending-for-driver/${driverId}`).pipe(
      tap(_ => this.log('fetched pending taxiOrders for driver')),
      catchError(this.handleError<TaxiOrder[]>('getPendingTaxiOrdersForDriver', []))
    );
  }

  // obter pedido especifico
  getTaxiOrderById(id: string): Observable<TaxiOrder> {
    return this.http.get<TaxiOrder>(`${this.baseUrl}/taxiOrder/${id}`).pipe(
      tap(_ => this.log(`fetched taxiOrder id=${id}`)),
      catchError(this.handleError<TaxiOrder>(`getTaxiOrderById id=${id}`))
    );
  }

  // criar um pedido
  createTaxiOrder(taxiOrder: TaxiOrder): Observable<TaxiOrder> {
    return this.http.post<TaxiOrder>(this.baseUrl, taxiOrder).pipe(
      tap((newTaxiOrder: TaxiOrder) => this.log(`created taxiOrder w/ id=${newTaxiOrder._id}`)),
      catchError(error => {
        this.log(`addTaxi failed: ${error.message}`);
        return throwError(() => error);
      })
    );
  }

  // aceitar um pedido
  acceptTaxiOrder(id: string, offer: any): Observable<TaxiOrder> {
    console.log('Enviando oferta:', offer);
    return this.http.put<TaxiOrder>(`${this.baseUrl}/accept/${id}`, { offer }).pipe(
      tap(_ => this.log(`Accepted taxiOrder id=${id}`)),
      catchError(this.handleError<TaxiOrder>('acceptTaxiOrder'))
    );
  }

  // confirmar um pedido
  confirmTaxiOrder(id: string): Observable<TaxiOrder> {
    return this.http.put<TaxiOrder>(`${this.baseUrl}/confirm/${id}`, {}).pipe(
      tap(_ => this.log(`confirmed taxiOrder id=${id}`)),
      catchError(this.handleError<TaxiOrder>('confirmTaxiOrder'))
    );
  }

  // rejeitar um pedido
  rejectTaxiOrder(id: string): Observable<TaxiOrder> {
    return this.http.put<TaxiOrder>(`${this.baseUrl}/reject/${id}`, {}).pipe(
      tap(_ => this.log(`rejected taxiOrder id=${id}`)),
      catchError(this.handleError<TaxiOrder>('rejectTaxiOrder'))
    );
  }

  // cancelar um pedido
  cancelTaxiOrder(id: string): Observable<TaxiOrder> {
    return this.http.put<TaxiOrder>(`${this.baseUrl}/cancel/${id}`, {}).pipe(
      tap(_ => this.log(`canceled taxiOrder id=${id}`)),
      catchError(this.handleError<TaxiOrder>('cancelTaxiOrder'))
    );
  }

  // resetar um pedido para pending
  resetTaxiOrder(id: string): Observable<TaxiOrder> {
    return this.http.put<TaxiOrder>(`${this.baseUrl}/reset/${id}`, {}).pipe(
      tap(_ => this.log(`reseted taxiOrder id=${id}`)),
      catchError(this.handleError<TaxiOrder>('resetTaxiOrder'))
    );
  }

  // motorista chegou e comecou a viagem
  driverArrived(id: string): Observable<TaxiOrder> {
    return this.http.put<TaxiOrder>(`${this.baseUrl}/arrived/${id}`, {}).pipe(
      tap(_ => this.log(`driverArrived taxiOrder id=${id}`)),
      catchError(this.handleError<TaxiOrder>('driverArrived'))
    );
  }

  private log(message: string) {
    this.messageService.add(`TaxiOrderService: ${message}`);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}