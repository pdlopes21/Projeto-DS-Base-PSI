import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Taxi } from '../../interfaces/taxi';
import { Driver } from '../../interfaces/driver';
import { DriverSessionService } from '../../services/sessions/driver-session/driver-session.service';
import { ShiftService } from '../../services/shift/shift.service';

@Component({
  selector: 'app-driver-dashboard',
  standalone: false,
  templateUrl: './driver-dashboard.component.html',
  styleUrl: './driver-dashboard.component.css',
})
export class DriverDashboardComponent implements OnInit {
  taxis: Taxi[] = [];
  driver?: Driver;
  taxi?: Taxi;

  shiftStart = { date: '', time: '' };
  shiftEnd = { date: '', time: '' };

  constructor(
    private router: Router,
    private driverSession: DriverSessionService,
    private shiftService: ShiftService
  ) { }

  onSubmitPeriod() {
    const start = new Date(`${this.shiftStart.date}T${this.shiftStart.time}`);
    const end = new Date(`${this.shiftEnd.date}T${this.shiftEnd.time}`);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      alert('Please fill in all dates and times.');
      return;
    }

    if (start >= end) {
      alert('Start must be before end.');
      return;
    }
    if (end.getTime() - start.getTime() > 8 * 60 * 60 * 1000) {
      alert('Duration cannot exceed 8 hours.');
      return;
    }
    if (start <= now) {
      alert('Shift must start after the current time.');
      return;
    }

    if (!this.driver || !this.driver._id) {
      alert('Driver information is missing.');
      return;
    }

    this.shiftService.getShiftsByDriver(this.driver._id).subscribe(shifts => {
      const overlapping = shifts.some(s =>
        new Date(s.timePeriod.start) < end && new Date(s.timePeriod.end) > start
      );
      if (overlapping) {
        alert('You already have a shift that overlaps with this period.');
        return;
      }

      this.shiftService.getAvailableTaxis(start, end).subscribe((taxis) => {
        this.taxis = taxis;
      });
    });
  }

  ngOnInit(): void {
    this.driver = this.driverSession.getDriver();
    if (!this.driver) {
      alert('Invalid session, driver must login first!');
      this.router.navigate(['/login/driver']);
      return;
    }
  }

  goToRequest() {
    this.router.navigate(
      ['/driver/driver-shift-request', this.taxi!.licensePlate],
      {
        queryParams: {
          start: this.shiftStart.date + 'T' + this.shiftStart.time,
          end: this.shiftEnd.date + 'T' + this.shiftEnd.time
        }
      }
    );
  }

  chooseTaxi(taxi: Taxi) {
    this.taxi = taxi;
    this.goToRequest();
  }
}
