import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ride } from '../../interfaces/ride';
import { RideStart } from '../../interfaces/rideStart';
import { RideEnd } from '../../interfaces/rideEnd';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RideService {
  private baseUrl = 'http://localhost:3000/rides';

  constructor(private http: HttpClient) { }

  // Listar todas as rides
  getAllRides(): Observable<Ride[]> {
    return this.http.get<Ride[]>(`${this.baseUrl}`);
  }

  // Obter ride por id
  getRideById(id: string): Observable<Ride> {
    return this.http.get<Ride>(`${this.baseUrl}/ride/${id}`);
  }

  // Obter todas as rides de um motorista especifico
  getRidesByDriver(driverId: string): Observable<Ride[]> {
    return this.http.get<Ride[]>(`${this.baseUrl}/driver/${driverId}`);
  }

  // Criar/iniciar ride
  startRide(rideStart: RideStart): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, rideStart);
  }

  // Finalizar ride
  finishRide(id: string, rideEnd: RideEnd): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/ride/${id}`, rideEnd);
  }

  // Obter uma viagem por um pedido especifico
  getRideByTaxiOrder(taxiOrderId: string): Observable<Ride> {
    return this.http.get<Ride>(`${this.baseUrl}/taxiOrder/${taxiOrderId}`);
  }

  // Obter todas as rides de um taxi especifico
  getRidesByTaxi(taxiId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}?taxiId=${taxiId}`);
  }
}
