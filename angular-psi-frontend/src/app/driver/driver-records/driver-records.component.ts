import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Ride } from '../../interfaces/ride';
import { RideService } from '../../services/ride/ride.service';
import { Driver } from '../../interfaces/driver';
import { DriverSessionService } from '../../services/sessions/driver-session/driver-session.service';
import { DriverService } from '../../services/driver/driver.service';

@Component({
  selector: 'app-driver-records',
  standalone: false,
  templateUrl: './driver-records.component.html',
  styleUrl: './driver-records.component.css'
})
export class DriverRecordsComponent implements OnInit {
  driver?: Driver;
  selectedRecord?: Ride;
  records?: Ride[];
  groupedRecords: { [key: string]: Ride[] } = {};

  constructor(private rideService: RideService, private driverSession: DriverSessionService, private router: Router, private driverService: DriverService) { }

  ngOnInit(): void {

    this.driver = this.driverSession.getDriver();
    if (!this.driver) {
      alert('Invalid session, driver must login first!');
      this.router.navigate(['/login/driver']);
      return;
    }
    this.findRecords();
  }

  findRecords(): void {
    const driverId = this.driver?._id;
    if (!driverId) {
      console.error('Driver ID is undefined');
      return;
    }

    this.rideService.getRidesByDriver(driverId).subscribe({
      next: (rides) => {
        this.records = rides.filter(ride => !!ride.timePeriod?.end);

        this.records.sort((a, b) =>
          new Date(b.timePeriod.start).getTime() - new Date(a.timePeriod.start).getTime()
        );

        // agrupar por datas
        this.groupedRecords = this.records.reduce((groups: { [key: string]: Ride[] }, ride: Ride) => {
          const dateKey = new Date(ride.timePeriod.start).toLocaleDateString('pt-PT');
          if (!groups[dateKey]) {
            groups[dateKey] = [];
          }
          groups[dateKey].push(ride);
          return groups;
        }, {}
        );
      },
      error: (error) => {
        console.error('Error finding Records', error);
        this.records = [];
      }
    });
  }

  // ordenar agrupamentos por mais recente
  get sortedDates(): string[] {
    return Object
      .keys(this.groupedRecords)
      .sort((a, b) =>
        new Date(b.split('/').reverse().join('-')).getTime()
        - new Date(a.split('/').reverse().join('-')).getTime()
      );
  }

  selectRecord(record: Ride) {
    if (this.selectedRecord === record) {
      this.selectedRecord = undefined;
    }
    else {
      this.selectedRecord = record;
    }
  }

  goToRecordDetails(record: Ride) {
    this.router.navigate(['/driver/records', record._id]);
  }
}
