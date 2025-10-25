import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription, timer, forkJoin } from 'rxjs';

import { Driver } from '../../interfaces/driver';
import { TaxiOrder } from '../../interfaces/taxiOrder';
import { Address } from '../../interfaces/address';
import { Taxi } from '../../interfaces/taxi';

import { TaxiOrderService } from '../../services/taxi-order/taxiOrder.service';
import { ShiftService } from '../../services/shift/shift.service';
import { PriceService } from '../../services/price/price.service';
import { DriverSessionService } from '../../services/sessions/driver-session/driver-session.service';
import { GeoService } from '../../services/geo/geo.service';

@Component({
  selector: 'app-driver-client-taxiOrder',
  templateUrl: './driver-client-taxi-order.component.html',
  standalone: false,
  styleUrls: ['./driver-client-taxi-order.component.css']
})
export class DriverClientTaxiOrderComponent implements OnInit, OnDestroy {
  driver?: Driver;
  activeShiftEnd?: Date;
  taxi?: Taxi;
  taxiOrders: (TaxiOrder & {
    distance: number;
    rideDistance: number;
  })[] = [];
  driverLocation?: { lat: number; lon: number };
  acceptedTaxiOrder?: TaxiOrder & {
    distance: number;
    rideDistance: number;
    estimatedRideDistance?: number;
    estimatedRideTime?: number;
  };

  private pendingTaxiOrdersPollingSub?: Subscription;
  private acceptedTaxiOrderPollingSub?: Subscription;

  constructor(
    private taxiOrderService: TaxiOrderService,
    private shiftService: ShiftService,
    private driverSession: DriverSessionService,
    private priceService: PriceService,
    private geoService: GeoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.driver = this.driverSession.getDriver();
    if (!this.driver) {
      alert('Invalid session, driver must login first!');
      this.router.navigate(['/login/driver']);
      return;
    }
    this.getActiveShift();
    this.pendingTaxiOrdersPollingSub = interval(10000).subscribe(() => this.getTaxiOrders());
  }

  ngOnDestroy(): void {
    this.pendingTaxiOrdersPollingSub?.unsubscribe();
    this.acceptedTaxiOrderPollingSub?.unsubscribe();
  }

  getActiveShift(): void {
    const driverId = this.driver!._id!;
    this.shiftService.getActiveShiftByDriver(driverId).subscribe(shift => {
      if (!shift) {
        alert('You must have an active shift to view client taxiOrders.');
        this.taxiOrders = [];
        return;
      }
      this.taxi = shift.taxi;
      this.activeShiftEnd = new Date(shift.timePeriod.end);
      this.driverSession.setActiveShiftId(shift._id!);
      this.getLocation();
    });
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          this.driverLocation = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          };
          this.getTaxiOrders();
        },
        _err => {
          // fallback para FCUL se não for possível obter localização
          this.driverLocation = { lat: 38.756734, lon: -9.155412 };
          this.getTaxiOrders();
        }
      );
    } else {
      this.driverLocation = { lat: 38.756734, lon: -9.155412 };
      this.getTaxiOrders();
    }
  }

  getTaxiOrders() {
    if (!this.driverLocation || !this.activeShiftEnd) return;

    const now = new Date();

    this.taxiOrderService.getPendingTaxiOrdersForDriver(this.driver?._id!).subscribe(pendingTaxiOrders => {
      if (pendingTaxiOrders.length === 0) {
        this.taxiOrders = [];
        return;
      }

      // filtrar por conforto
      const filteredByComfort = pendingTaxiOrders.filter(r => r.comfortLevel === this.taxi?.comfortLevel);

      // verificar quais pedidos nao estao mais pendentes e remove-los da lista 
      const incomingIds = filteredByComfort.map(r => r._id!);
      this.taxiOrders = this.taxiOrders.filter(req => incomingIds.includes(req._id!));

      // verifica se pedido ja esta em taxiOrders, evitar calculos desnecessarios
      const newTaxiOrders = filteredByComfort.filter(r => !this.taxiOrders.find(req => req._id === r._id));

      newTaxiOrders.forEach(r => {
        const distance = this.geoService.haversine(
          this.driverLocation!.lat,
          this.driverLocation!.lon,
          r.location.lat,
          r.location.lon
        );
        const rideDistance = this.geoService.haversine(
          r.location.lat,
          r.location.lon,
          r.destination.lat,
          r.destination.lon
        );
        const totalRideTime = this.geoService.estimateTravelTime(distance + rideDistance);
        const endTime = new Date(now.getTime() + totalRideTime * 60000);

        // apenas os pedidos que podem ser satisfeitos dentro do turno atual
        if (endTime <= this.activeShiftEnd!) {
          this.taxiOrders.push({ ...r, distance, rideDistance });
        }
      });

      // ordenar pela distancia
      this.taxiOrders.sort((a, b) => a.distance - b.distance);
    });
  }

  acceptTaxiOrder(taxiOrderId: string) {
    const found = this.taxiOrders.find(r => r._id === taxiOrderId);
    if (!found) {
      alert('TaxiOrder information is missing.');
      return;
    }

    if (!this.driver) {
      alert('Driver information is missing. Please log in again.');
      return;
    }

    // obter informacao para calcular preco
    this.priceService.getPrice(this.taxi?.comfortLevel!).subscribe(price => {
      if (!price) {
        alert('Could not find the price for the taxi type.');
        return;
      }
      this.priceService.getNightIncrease().subscribe(nightIncrease => {
        if (!nightIncrease) {
          alert('Could not find the global night increase.');
          return;
        }

        const rideTime = this.geoService.estimateTravelTime(found.rideDistance);
        const now = new Date();
        const startMinutes = now.getHours() * 60 + now.getMinutes();
        const endMinutes = startMinutes + rideTime;

        let total = 0;
        for (let t = startMinutes; t < endMinutes; t++) {
          const minuteOfDay = t % (24 * 60);
          const isNight = minuteOfDay >= 21 * 60 || minuteOfDay < 6 * 60;
          const multiplier = isNight ? 1 + nightIncrease / 100 : 1;
          total += price.pricePerMinute * multiplier;
        }

        const offer = {
          driver: this.driver?._id!,
          taxi: this.taxi?._id!,
          location: this.driverLocation!,
          distance: found.distance,
          price: parseFloat(total.toFixed(2))
        };

        // aceitar pedido e enviar a oferta no body
        this.taxiOrderService.acceptTaxiOrder(taxiOrderId!, offer).subscribe({
          next: () => {
            this.acceptedTaxiOrder = found;
            this.acceptedTaxiOrder.estimatedRideDistance = this.geoService.haversine(found.location.lat, found.location.lon, found.destination.lat, found.destination.lon);
            this.acceptedTaxiOrder.estimatedRideTime = Math.round(this.geoService.estimateTravelTime(this.acceptedTaxiOrder.estimatedRideDistance));

            this.taxiOrders = [];
            this.pendingTaxiOrdersPollingSub?.unsubscribe();
            this.startAcceptedTaxiOrderPolling();
          },
          error: (err) => {
            console.error('Error accepting the taxiOrder:', err);
            alert('It was not possible to accept the taxiOrder. Try again later.');
          }
        });
      });
    });
  }

  startAcceptedTaxiOrderPolling() {
    if (!this.acceptedTaxiOrder) return;

    this.acceptedTaxiOrderPollingSub = timer(0, 3000).subscribe(() => {
      this.taxiOrderService.getTaxiOrderById(this.acceptedTaxiOrder!._id!).subscribe(req => {
        if (req.status !== this.acceptedTaxiOrder!.status) {
          this.acceptedTaxiOrder = { ...this.acceptedTaxiOrder!, status: req.status };

          // se o cliente confirma, rejeita ou cancela paramos o polling
          if (req.status === 'confirmed' || req.status === 'rejected' || req.status === 'canceled') {
            this.acceptedTaxiOrderPollingSub?.unsubscribe();
          }
        }
      });
    });
  }

  goToRide() {
    if (this.acceptedTaxiOrder) {
      this.taxiOrderService.driverArrived(this.acceptedTaxiOrder._id!).subscribe({
        next: updated => {
          this.driverSession.setTaxiOrderId(updated._id!);
          this.router.navigate(['/driver/start-ride']);
        },
        error: err => {
          console.error(err);
        }
      });
    }
  }

  backToPending() {
    this.acceptedTaxiOrder = undefined;
    this.getTaxiOrders();
    this.pendingTaxiOrdersPollingSub = interval(10000).subscribe(() => this.getTaxiOrders());
  }
}