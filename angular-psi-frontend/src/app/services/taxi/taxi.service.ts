import { Injectable } from '@angular/core';
import { Taxi } from '../../interfaces/taxi';
import { Observable, of, throwError } from 'rxjs';
import { MessageService } from '../message/message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TaxiService {

  private taxisUrl = 'http://localhost:3000/taxis';      // endpoint no express

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient, private messageService: MessageService) { }

  /** mensagens de MessageService relacionadas a TaxiService */
  private log(message: string) {
    this.messageService.add(`TaxiService: ${message}`);
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

  // Listar todos os taxis
  getTaxis(): Observable<Taxi[]> {
    return this.http.get<Taxi[]>(this.taxisUrl)
      .pipe(
        tap(_ => this.log('taxis obtained')),
        catchError(this.handleError<Taxi[]>('getTaxis', []))
      );
  }

  // Obter taxi pela matricula
  getTaxiByLicensePlate(matricula: string): Observable<Taxi> {
    const url = `${this.taxisUrl}/by-plate/${matricula}`;
    return this.http.get<Taxi>(url)
      .pipe(
        tap(_ => this.log(`taxi obtained: ${matricula}`)),
        catchError(this.handleError<Taxi>(`getTaxiByLicensePlate licensePlate=${matricula}`))
      );
  }

  // Obter taxi pelo id
  getTaxi(id: string): Observable<Taxi> {
    return this.http.get<Taxi>(`${this.taxisUrl}/${id}`);
  }

  // Adicionar um taxi
  addTaxi(taxi: Taxi): Observable<Taxi> {
    return this.http.post<Taxi>(this.taxisUrl, taxi, this.httpOptions).pipe(
      tap((newTaxi: Taxi) => this.log(`added taxi w/ id=${newTaxi._id}`)),
      catchError(error => {
        this.log(`addTaxi failed: ${error.message}`);
        return throwError(() => error);
      })
    );
  }

  // Atualizar um taxi
  updateTaxi(id: string, taxi: Taxi): Observable<Taxi> {
    return this.http.put<Taxi>(`${this.taxisUrl}/${id}`, taxi, this.httpOptions);
  }

  // Remover um taxi
  deleteTaxi(id: string) {
    return this.http.delete(`${this.taxisUrl}/${id}`);
  }

  // Ver se taxi foi usado em turnos
  taxiHasShifts(taxiId: string): Observable<boolean> {
    const url = `${this.taxisUrl}/has-shifts/${taxiId}`;
    return this.http.get<{ exists: boolean }>(url).pipe(
      map(res => res.exists),
      catchError(this.handleError<boolean>('taxiHasShifts', false))
    );
  }

  // Ver se taxi foi usado em viagens
  taxiHasRides(taxiId: string): Observable<boolean> {
    const url = `${this.taxisUrl}/has-rides/${taxiId}`;
    return this.http.get<{ exists: boolean }>(url).pipe(
      map(res => res.exists),
      catchError(this.handleError<boolean>('taxiHasRides', false))
    );
  }
}
