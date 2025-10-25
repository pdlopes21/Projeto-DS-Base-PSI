import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

import { Address } from "../../interfaces/address";

@Injectable({
  providedIn: 'root'
})
export class GeoService {

  constructor() { }

  private toRad(x: number): number {
    return x * Math.PI / 180;
  }

  // retorna distancia em km entre duas coordenadas
  haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  }

  // estima o tempo de viagem em minutos dado distancia (km) e velocidade media (km/h)
  // 4 min/km = 15km/h
  estimateTravelTime(distanceKm: number, avgSpeedKmH = 15): number {
    return (distanceKm / avgSpeedKmH) * 60;
  }

  // traduz Address para coordenadas
  geocodeFromAddress(addr: Address): Observable<{ lat: number, lon: number }> {
    const query = `${addr.street} ${addr.doorNumber}, ${addr.postalCode} ${addr.locality}`;
    const encoded = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;

    return from(
      fetch(url, { headers: { 'User-Agent': 'YourAppName/1.0' } })
        .then(res => res.json())
        .then(data => {
          if (!data || data.length === 0) throw new Error('Address not found');
          const { lat, lon } = data[0];
          return { lat: parseFloat(lat), lon: parseFloat(lon) };
        })
    );
  }

  // traduz coordenadas para Address
  reverseGeocode(lat: number, lon: number): Observable<Address> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    return from(
      fetch(url, {
        headers: { 'User-Agent': 'YourAppName/1.0' }
      })
        .then(res => res.json())
        .then(data => {
          const address = data.address;
          return {
            street: address.road || '',
            doorNumber: address.house_number || '',
            postalCode: address.postcode || '',
            locality: address.city || address.town || address.village || ''
          } as Address;
        })
    );
  }
}
