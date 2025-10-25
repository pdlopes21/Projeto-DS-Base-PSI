import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Price } from '../../interfaces/price';
import { catchError, map, tap } from 'rxjs/operators';
import { MessageService } from '../message/message.service';

@Injectable({ providedIn: 'root' })

export class PriceService {

  private baseUrl = 'http://localhost:3000/prices';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient, private messageService: MessageService) {}

  // retorna ambos os precos
  getPrices(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  // retorna o preco associado ao nivel de conforto do taxi
  getPrice(taxiType: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/by-taxi-type/${taxiType}`);
  }

  // atualiza o preco associado ao nivel de conforto do taxi
  update(price: Price): Observable<any> {
    return this.http.put<Price>(this.baseUrl, price, this.httpOptions).pipe(
          tap((newPrice: Price) => this.log(`updated price for ${newPrice.taxiType} taxis`)),
          catchError(error => {
            this.log(`updatePrice failed: ${error.message}`);
            return throwError(() => error);
          })
        );
  }

  // obtem o aumento de preco noturno
  getNightIncrease(): Observable<number> {
    return this.http.get<{ nightTimeIncrease: number }>(`${this.baseUrl}/night-increase`)
      .pipe(
        map(res => res.nightTimeIncrease),
        catchError(this.handleError<number>('getNightIncrease', 0))
      );
  }

  // atualiza o aumento de preco noturno
  updateNightIncrease(value: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/night-increase`, { nightTimeIncrease: value }, this.httpOptions).pipe(
      tap(() => this.log(`updated global nightTimeIncrease to ${value}%`)),
      catchError(this.handleError<any>('updateNightIncrease'))
    );
  }

  /** mensagens de MessageService relacionadas a PriceService */
  private log(message: string) {
    this.messageService.add(`PriceService: ${message}`);
  }

  /**
     * Lidar com a operacao HTTP que falhou.
     * Deixar a aplicacao ontinuar.
     * @param operation - nome da operacao que falhou
     * @param result - valor opcional a ser retornado como resultado observavel
     */
    private handleError<T>(operation = 'operation', result?: T) {
      return (error: any): Observable<T> => {
  
        console.error(error);
        this.log(`${operation} failed: ${error.message}`);
  
        return of(result as T);
      };
    }  
}