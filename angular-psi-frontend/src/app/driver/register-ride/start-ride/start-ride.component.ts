import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { RideStart } from '../../../interfaces/rideStart';
import { Address } from '../../../interfaces/address';
import { TaxiOrderService } from '../../../services/taxi-order/taxiOrder.service';
import { DriverSessionService } from '../../../services/sessions/driver-session/driver-session.service';
import { RideService } from '../../../services/ride/ride.service';
import { GeoService } from '../../../services/geo/geo.service';

@Component({
  selector: 'app-start-ride',
  standalone: false,
  templateUrl: './start-ride.component.html',
  styleUrl: './start-ride.component.css'
})
export class StartRideComponent {

  rideStart: RideStart = {
    client: { name: '', nif: '', gender: 'male' },
    shift: '',
    timePeriod: { start: new Date() },
    start: { lat: 0, lon: 0 },
    numberOfPeople: 1,
    sequenceNumber: 1,
    taxiOrder: ''
  };
  translatedStartAddress!: Address;
  startTimeStr: string = '';
  startDateStr: string = '';
  minStartDate: string = '';
  maxStartDate: string = '';

  constructor(
    private router: Router,
    private taxiOrderService: TaxiOrderService,
    private rideService: RideService,
    private geoService: GeoService,
    private driverSession: DriverSessionService
  ) { }

  ngOnInit(): void {
    const driver = this.driverSession.getDriver();
    if (!driver) {
      this.router.navigate(['/login/driver']);
      return;
    }

    // iniciar startTimeStr com horario atual
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = (now.getMinutes() + 1).toString().padStart(2, '0');
    this.startTimeStr = `${hh}:${mm}`;

    // iniciar startDateStr com dia atual e permitir ate o dia seguinte
    const today = new Date();
    const yyyy = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.startDateStr = `${yyyy}-${m}-${dd}`;
    this.minStartDate = this.startDateStr;

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tdd = String(tomorrow.getDate()).padStart(2, '0');
    this.maxStartDate = `${yyyy}-${m}-${tdd}`;

    const taxiOrderId = this.driverSession.getTaxiOrderId();
    if (taxiOrderId) {
      this.taxiOrderService.getTaxiOrderById(taxiOrderId).subscribe(req => {
        this.rideStart.taxiOrder = req._id!;
        this.rideStart.client = req.client;
        this.rideStart.start = req.location;
        this.rideStart.numberOfPeople = req.numberOfPeople;
        this.rideStart.shift = this.driverSession.getActiveShiftId();
        this.translatedStartAddress = req.locationAddress!;
      });
    }
  }

  validateStartRide(): string | null {
    const { client, timePeriod, start, numberOfPeople, shift } = this.rideStart;

    if (!/^[0-9]{9}$/.test(client.nif)) return 'NIF must be 9 digits.';
    if (!client.name.trim() || client.name.length > 100 || /[^a-zA-Z0-9 ]/.test(client.name))
      return 'Invalid client name.';
    if (!['male', 'female'].includes(client.gender)) return 'Gender must be male or female.';
    if (!shift) return 'Shift is missing.';
    if (!timePeriod.start || isNaN(timePeriod.start.getTime()))
      return 'Start time must be a valid date.';
    if (start.lat < -90 || start.lat > 90)
      return 'Start address latitude must be between -90 and 90.';
    if (start.lon < -180 || start.lon > 180)
      return 'Start address longitude must be between -180 and 180.';
    if (!Number.isInteger(numberOfPeople) || numberOfPeople < 1 || numberOfPeople > 6)
      return 'Number of people must be between 1 and 6.';
    if (!this.translatedStartAddress.street)
      return 'Street name must be entered.';
    if (!this.translatedStartAddress.doorNumber)
      return 'Door number must be entered.';
    if (!this.translatedStartAddress.locality)
      return 'Locality must be entered.';

    return null;
  }

  startRide() {
    const error = this.validateStartRide();
    if (error) {
      alert(error);
      return;
    }
    // traduzir endereco para coordenadas
    this.geoService.geocodeFromAddress(this.translatedStartAddress).subscribe({
      next: (coordinates) => {

        this.rideStart.start = { lat: coordinates.lat, lon: coordinates.lon };
        this.rideStart.startAddress = this.translatedStartAddress;

        // montar a data com data + horario escolhido
        const [year, month, day] = this.startDateStr.split('-').map(Number);
        const [hours, minutes] = this.startTimeStr.split(':').map(Number);
        this.rideStart.timePeriod.start = new Date(year, month - 1, day, hours, minutes, 0, 0);

        // iniciar a viagem
        this.rideService.startRide(this.rideStart).subscribe({
          next: (newRide) => {
            alert('Ride started successfully!');
            this.router.navigate(['/driver/finish-ride', newRide._id]);
          },
          error: err => {
            alert('Failed to start ride: ' + (err.error?.message || 'Unexpected error.'));
          }
        });
      },
      error: (err) => {
        alert('Failed to geocode address: ' + err.message);
      }
    });
  }
}