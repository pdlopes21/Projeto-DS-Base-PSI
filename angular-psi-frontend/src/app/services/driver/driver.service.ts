import { Injectable } from '@angular/core';
import { Driver } from '../../interfaces/driver';
import { Observable, of, throwError } from 'rxjs';
import { MessageService } from '../message/message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DriverService {
  constructor(
    private messageService: MessageService,
    private http: HttpClient
  ) { }

  private driversUrl = 'http://localhost:3000/drivers';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  /**mensagens de MessageService relacionadas a DriverService*/
  private log(message: string) {
    this.messageService.add(`DriverService: ${message}`);
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

  // Listar todos os motoristas
  getDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(this.driversUrl).pipe(
      tap((_) => this.log('drivers obtained')),
      catchError(this.handleError<Driver[]>('getDrivers', []))
    );
  }

  // Obter motorista pelo nif
  getDriverByNif(nif: string): Observable<Driver> {
    const url = `${this.driversUrl}/by-nif/${nif}`;
    return this.http.get<Driver>(url).pipe(
      tap((_) => this.log(`Driver obtained with nif : ${nif}`)),
      catchError(this.handleError<Driver>(`getDriverByNif nif=${nif}`))
    );
  }

  // Obter motorista pelo id
  getDriver(id: string): Observable<Driver> {
    const url = `${this.driversUrl}/${id}`;
    return this.http.get<Driver>(url).pipe(
      tap((_) => this.log(`Driver obtained: ${id}`)),
      catchError(this.handleError<Driver>(`getDriverById id=${id}`))
    );
  }

  // Adicionar um motorista
  addDriver(driver: Driver): Observable<Driver> {
    return this.http.post<Driver>(this.driversUrl, driver, this.httpOptions).pipe(
      tap((newDriver: Driver) => this.log(`Driver added: ${newDriver.nif}`)),
      catchError((error) => {
        this.log(`add Driver failed: ${error.message}`);
        return throwError(() => error);
      })
    );
  }

  // Atualizar um motorista
  updateDriver(driver: Driver): Observable<Driver> {
    const url = `${this.driversUrl}/${driver._id}`;
    return this.http.put<Driver>(url, driver, this.httpOptions).pipe(
      tap((_) => this.log(`Driver updated: ${driver.nif}`)),
      catchError((error) => {
        this.log(`update Driver failed: ${error.message}`);
        return throwError(() => error);
      })
    );
  }

  // Remover um motorista
  deleteDriver(driver: Driver): Observable<any> {
    const url = `${this.driversUrl}/${driver._id}`;
    return this.http.delete(url, this.httpOptions).pipe(
      tap((_) => this.log(`Driver deleted: ${driver._id}`)),
      catchError(this.handleError<any>('deleteDriver'))
    );
  }

  // Ver se motorista foi usado em turnos
  driverHasShifts(driverId: string): Observable<boolean> {
    const url = `${this.driversUrl}/has-shifts/${driverId}`;
    return this.http.get<{ exists: boolean }>(url).pipe(
      map(res => res.exists),
      catchError(this.handleError<boolean>('driverHasShifts', false))
    );
  }
}
