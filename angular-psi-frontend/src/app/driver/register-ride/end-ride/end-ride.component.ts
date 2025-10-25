import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Ride } from '../../../interfaces/ride';
import { RideEnd } from '../../../interfaces/rideEnd';
import { Address } from '../../../interfaces/address';
import { TaxiOrderService } from '../../../services/taxi-order/taxiOrder.service';
import { DriverSessionService } from '../../../services/sessions/driver-session/driver-session.service';
import { RideService } from '../../../services/ride/ride.service';
import { GeoService } from '../../../services/geo/geo.service';

@Component({
  selector: 'app-end-ride',
  standalone: false,
  templateUrl: './end-ride.component.html',
  styleUrls: ['./end-ride.component.css']
})
export class EndRideComponent implements OnInit {
  ride?: Ride;
  rideEnd: RideEnd = {
    timePeriod: { end: new Date() },
    end: { lat: 0, lon: 0 }
  };
  endTimeStr: string = '';
  endDateStr: string = '';
  minEndDate: string = '';
  maxEndDate: string = '';
  translatedEndAddress!: Address;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taxiOrderService: TaxiOrderService,
    private rideService: RideService,
    private geoService: GeoService,
    private driverSession: DriverSessionService
  ) { }

  ngOnInit(): void {
    const rideId = this.route.snapshot.paramMap.get('rideId')!;
    if (!rideId) {
      alert('Ride ID is missing');
      this.router.navigate(['/driver/dashboard']);
      return;
    }
    this.rideService.getRideById(rideId).subscribe({
      next: ride => {
        this.ride = ride;

        // iniciar endDateStr com dia atual e permitir ate o dia seguinte
        const today = new Date();
        const yyyy = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        this.endDateStr = `${yyyy}-${m}-${dd}`;
        this.minEndDate = this.endDateStr;

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tdd = String(tomorrow.getDate()).padStart(2, '0');
        this.maxEndDate = `${yyyy}-${m}-${tdd}`;

        const taxiOrderId = this.driverSession.getTaxiOrderId();
        if (taxiOrderId) {
          this.taxiOrderService.getTaxiOrderById(taxiOrderId).subscribe(req => {
            this.rideEnd.end = req.destination;
            this.translatedEndAddress = req.destinationAddress!;

            // calcular tempo estimado de viagem
            const estimatedMinutes = this.geoService.estimateTravelTime(
              this.geoService.haversine(
                this.ride!.start.lat,
                this.ride!.start.lon,
                req.destination.lat,
                req.destination.lon
              )
            );

            // adicionar tempo estimado ao horário de início da viagem
            const start = new Date(this.ride!.timePeriod.start);
            const estimatedEnd = new Date(start.getTime() + estimatedMinutes * 60000);

            // formatar horário
            const hh = estimatedEnd.getHours().toString().padStart(2, '0');
            const mm = estimatedEnd.getMinutes().toString().padStart(2, '0');
            this.endTimeStr = `${hh}:${mm}`;
          });
        }
      },
      error: () => {
        alert('Failed to load ride');
        this.router.navigate(['/driver/records']);
      }
    });
  }

  validateEndRide(): string | null {
    if (!this.translatedEndAddress.street)
      return 'Street name must be entered.';
    if (!this.translatedEndAddress.doorNumber)
      return 'Door number must be entered.';
    if (!this.translatedEndAddress.locality)
      return 'Locality must be entered.';
    if (!/^[0-2]\d:[0-5]\d$/.test(this.endTimeStr))
      return 'Invalid time format.';

    return null;
  }

  finishRide() {
    const err = this.validateEndRide();
    if (err) {
      alert(err);
      return;
    }
    // traduzir endereco para coordenadas
    this.geoService.geocodeFromAddress(this.translatedEndAddress).subscribe({
      next: (coordinates) => {

        this.rideEnd.end = { lat: coordinates.lat, lon: coordinates.lon };
        this.rideEnd.endAddress = this.translatedEndAddress;

        // montar a data com data + horario escolhido
        const [year, month, day] = this.endDateStr.split('-').map(Number);
        const [hours, minutes] = this.endTimeStr.split(':').map(Number);
        this.rideEnd.timePeriod.end = new Date(year, month - 1, day, hours, minutes, 0, 0);

        // iniciar a viagem
        this.rideService.finishRide(this.ride?._id!, this.rideEnd).subscribe({
          next: () => {
            alert('Ride ended successfully!');
            this.router.navigate(['/driver/records/', this.ride?._id!]);
          },
          error: err => {
            alert('Failed to end ride: ' + (err.error?.message || 'Unexpected error.'));
          }
        });
      },
      error: (err) => {
        alert('Failed to geocode address: ' + err.message);
      }
    });
  }
}
