import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { Taxi } from '../../interfaces/taxi';
import { TaxiService } from '../../services/taxi/taxi.service';
import { Shift } from '../../interfaces/shift';
import { Driver } from '../../interfaces/driver';
import { DriverLoginComponent } from '../../login/driver-login/driver-login.component';
import { DriverSessionService } from '../../services/sessions/driver-session/driver-session.service';
import { ShiftService } from '../../services/shift/shift.service';

@Component({
  selector: 'app-driver-shift-request',
  standalone: false,
  templateUrl: './driver-shift-request.component.html',
  styleUrl: './driver-shift-request.component.css',
})
export class DriverShiftRequestComponent {
  taxi: Taxi | undefined;

  shift: Shift | undefined;

  driver: Driver | undefined;

  shiftStart = { date: '', time: '' };
  shiftEnd = { date: '', time: '' };
  shiftError: string = '';

  constructor(
    private route: ActivatedRoute,
    private taxiService: TaxiService,
    private location: Location,
    private driverSessionService: DriverSessionService,
    private router: Router,
    private shiftService: ShiftService
  ) {}

  ngOnInit(): void {
    this.driver = this.driverSessionService.getDriver();

    if (!this.driver) {
      alert('Invalid session, driver must login first!');
      this.router.navigate(['/login/driver']);
      return;
    }

    // Receber start e end dos query params
    this.route.queryParams.subscribe(params => {
      if (params['start']) {
        const [date, time] = params['start'].split('T');
        this.shiftStart.date = date;
        this.shiftStart.time = time;
      }
      if (params['end']) {
        const [date, time] = params['end'].split('T');
        this.shiftEnd.date = date;
        this.shiftEnd.time = time;
      }
    });

    this.getTaxi();
  }

  getTaxi(): void {
    const matricula = String(this.route.snapshot.paramMap.get('licensePlate'));
    this.taxiService
      .getTaxiByLicensePlate(matricula)
      .subscribe((taxi) => (this.taxi = taxi));
  }

  goBack(): void {
    this.location.back();
  }

  onSubmitShiftRequest() {

    const startString = `${this.shiftStart.date}T${this.shiftStart.time}`;
    const endString = `${this.shiftEnd.date}T${this.shiftEnd.time}`;
    const start = new Date(startString);
    const end = new Date(endString);

    if (!this.driver || !this.driver._id) {
      this.shiftError = 'Driver information is missing.';
      alert(this.shiftError);
      return;
    }
    if (!this.taxi || !this.taxi._id) {
      this.shiftError = 'Taxi information is missing.';
      alert(this.shiftError);
      return;
    }

    this.shift = {
      driver: this.driver._id,
      taxi: this.taxi,
      timePeriod: { start, end }
    };

    this.shiftService.createShift(this.driver!._id, this.shift).subscribe({
      next: () => {
        this.shiftError = '';
        alert('Shift successfully created!');
      },
      error: () => {
        this.shiftError = 'Error creating shift';
        alert(this.shiftError);
      },
    });

    this.router.navigate(['/driver/shifts']).then(() => {
    window.location.reload();
  });
  }
}
