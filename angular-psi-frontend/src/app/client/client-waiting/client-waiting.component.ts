import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription, timer } from 'rxjs';
import { Router } from '@angular/router';

import { TaxiOrder } from '../../interfaces/taxiOrder';
import { Ride } from '../../interfaces/ride';
import { TaxiOrderService } from '../../services/taxi-order/taxiOrder.service';
import { GeoService } from '../../services/geo/geo.service';
import { RideService } from '../../services/ride/ride.service';
import { ClientSessionService } from '../../services/sessions/client-session/client-session.service';

@Component({
  selector: 'app-client-waiting',
  standalone: false,
  templateUrl: './client-waiting.component.html',
  styleUrl: './client-waiting.component.css'
})
export class ClientWaitingComponent implements OnInit, OnDestroy {

  taxiOrderId?: string;
  taxiOrder?: TaxiOrder;

  offerRejected = false;
  confirmed: Boolean = false;

  estimatedRideTime?: number;
  estimatedArrivalTime?: number;

  private pollSub?: Subscription;

  completedRide?: Ride;
  private ridePollSub?: Subscription;

  isWaitingForRide = false;

  constructor(
    private taxiOrderService: TaxiOrderService,
    private clientSession: ClientSessionService,
    private geoService: GeoService,
    private rideService: RideService,
    private router: Router
  ) { }

  ngOnInit() {
    this.taxiOrder = this.clientSession.getTaxiOrder();
    this.taxiOrderId = this.taxiOrder?._id;
    if (!this.taxiOrderId) {
      alert('No pending orders.');
      this.router.navigate(['/login']);
      return;
    }
    this.pollSub = timer(0, 4000).subscribe(() => this.checkOrder());
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  private checkOrder() {
    this.taxiOrderService.getTaxiOrderById(this.taxiOrderId!).subscribe({
      next: (req) => {
        if (req.status === 'accepted' && req.offer?.driver && req.offer?.taxi) {
          this.taxiOrder = req;

          this.estimatedArrivalTime = Math.round(this.geoService.estimateTravelTime(req.offer.distance));

          const rideDistance = this.geoService.haversine(req.location.lat, req.location.lon, req.destination.lat, req.destination.lon);
          this.estimatedRideTime = Math.round(this.geoService.estimateTravelTime(rideDistance));
        }
        if (req.status === 'driverArrived') {
          this.taxiOrder = req;
          this.pollSub?.unsubscribe();
        }
      },
      error: (err) => {
        console.error('Error checking offer for the order', err);
      }
    });
  }

  confirm() {
    if (!this.taxiOrder) return;
    this.taxiOrderService.confirmTaxiOrder(this.taxiOrder._id!).subscribe({
      error: err => { console.error(err); alert('It was not possible to confirm the offer.'); }
    });
    this.confirmed = true;
  }

  reject() {
    if (!this.taxiOrder) return;
    this.taxiOrderService.rejectTaxiOrder(this.taxiOrder._id!).subscribe({
      next: () => {
        this.offerRejected = true;
        this.taxiOrder!.offer = undefined;
        this.pollSub?.unsubscribe();
      },
      error: err => { console.error(err); alert('It was not possible to reject the offer.'); }
    });
  }

  findAnotherDriver() {
    if (!this.taxiOrder) return;
    this.taxiOrderService.resetTaxiOrder(this.taxiOrder._id!).subscribe({
      next: () => {
        this.offerRejected = false;
        // volta a buscar ate outro motorista aceitar
        this.pollSub = timer(0, 4000).subscribe(() => this.checkOrder());
      },
      error: err => {
        console.error(err);
        alert('Could not reset the order to pending.');
      }
    });
  }

  waitForRideEnd() {
    if (!this.taxiOrderId) return;
    this.pollSub?.unsubscribe();
    this.isWaitingForRide = true;

    this.ridePollSub = timer(0, 5000).subscribe(() => {
      this.rideService.getRideByTaxiOrder(this.taxiOrderId!)
        .subscribe(ride => {
          if (!ride) return;
          this.ridePollSub?.unsubscribe();
          this.completedRide = ride;
        });
    });
  }

  cancel() {
    if (!this.taxiOrderId) return;
    this.taxiOrderService.cancelTaxiOrder(this.taxiOrderId).subscribe({
      next: () => this.router.navigate(['/client']),
      error: err => { console.error(err); alert('It was not possible to cancel.'); }
    });
  }

  toHome() {
    this.router.navigate(['/login']);
  }
}
