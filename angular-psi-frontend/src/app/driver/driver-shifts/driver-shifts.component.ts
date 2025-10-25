import { Component, OnInit } from '@angular/core';
import { ShiftService } from '../../services/shift/shift.service';
import { DriverSessionService } from '../../services/sessions/driver-session/driver-session.service';
import { Shift } from '../../interfaces/shift';

@Component({
  selector: 'app-driver-shifts',
  standalone: false,
  templateUrl: './driver-shifts.component.html',
  styleUrls: ['./driver-shifts.component.css']
})
export class DriverShiftsComponent implements OnInit {
  shifts: Shift[] = [];
  driverId?: string;

  constructor(private shiftService: ShiftService, private driverSession: DriverSessionService) {}

  ngOnInit(): void {
    const driver = this.driverSession.getDriver();
    this.driverId = driver?._id;
    if (this.driverId) {
      this.shiftService.getShiftsByDriver(this.driverId).subscribe(shifts => {
        this.shifts = shifts.sort((a, b) =>
          new Date(b.timePeriod.start).getTime() - new Date(a.timePeriod.start).getTime()
        );
      });
    }
  }
}
