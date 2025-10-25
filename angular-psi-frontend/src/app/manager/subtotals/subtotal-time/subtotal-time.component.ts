import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TimePeriod } from '../../../interfaces/timePeriod';
import { DriverSubtotals, ReportSubtotals, TaxiSubtotals } from '../../../interfaces/report';
import { ReportService } from '../../../services/report/report.service';
import { Address } from '../../../interfaces/address';

@Component({
  selector: 'app-subtotal-time',
  standalone: false,
  templateUrl: './subtotal-time.component.html',
  styleUrl: './subtotal-time.component.css'
})
export class SubtotalTimeComponent {
  pressed: boolean = false;
  startDate: Date | undefined;
  endDate: Date | undefined;
  timePeriod!: TimePeriod;
  startTime: string | undefined;
  endTime: string | undefined;

  subtotals?: ReportSubtotals;
  driverSubTotals?: DriverSubtotals
  taxiSubTotals?: TaxiSubtotals

  durationDriver?: number
  durationTaxi?: number

  openedIndexDriver: number | null = null
  openedIndexTaxi: number | null = null

  constructor(private router: Router, private route: ActivatedRoute, private reportService: ReportService) { }
  goBack(): void{
    const queryParams = this.route.snapshot.queryParams;
    this.router.navigate(['/manager/dashboard'], {
      queryParams: queryParams
    })
  }
  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      const startParam = params['start'];
      const endParam = params['end'];

      const now = new Date();
      let start: Date;
      let end: Date;

      if (startParam) {
        start = new Date(startParam);
      } else {
        start = new Date();
        start.setHours(0, 0, 0, 0);
      }

      if (endParam) {
        end = new Date(endParam);
      } else {
        end = new Date();
        end.setHours(23, 59, 59, 999);
      }

      this.startDate = start;
      this.endDate = end;
      this.timePeriod = { start, end };

      const startHours = start.getHours().toString().padStart(2, '0');
      const startMinutes = start.getMinutes().toString().padStart(2, '0');
      const endHours = end.getHours().toString().padStart(2, '0');
      const endMinutes = end.getMinutes().toString().padStart(2, '0');

      this.startTime = `${startHours}:${startMinutes}`;
      this.endTime = `${endHours}:${endMinutes}`;

      this.loadReportData();

    });

  }
  loadReportData(): void {
    this.reportService.getReportSubtotals(this.timePeriod).subscribe(s => { this.subtotals = s });
  }
  getMoreInfoDriver(index: number): void {
    this.openedIndexDriver = this.openedIndexDriver === index ? null : index;

    const drivers = this.orderedDriversByHoursDesc;

    if (this.openedIndexDriver !== null && this.subtotals?.drivers && drivers) {
      const driverId = drivers[this.openedIndexDriver].id;

      this.reportService.getDriverSubtotals(driverId, this.timePeriod)
        .subscribe(d => {
          this.driverSubTotals = d;

          const ride = d?.rides[index];
          if (ride?.timePeriod?.start && ride.timePeriod.end) {
            this.durationDriver = this.rideDuration(ride.timePeriod.start, ride.timePeriod.end);
          }
        });
    }
  }

  getMoreInfoTaxi(index: number): void {
    this.openedIndexTaxi = this.openedIndexTaxi === index ? null : index;

    const taxis = this.orderedTaxisByHoursDesc;

    if (this.openedIndexTaxi !== null && this.subtotals?.taxis && taxis) {
      const taxiId = taxis[this.openedIndexTaxi].id;

      this.reportService.getTaxiSubtotals(taxiId, this.timePeriod)
        .subscribe(t => {
          this.taxiSubTotals = t;

          const ride = t.rides[index];
          if (ride?.timePeriod?.start && ride.timePeriod.end) {
            this.durationTaxi = this.rideDuration(ride.timePeriod.start, ride.timePeriod.end);
          }
        });
    }
  }
  goToTripInfo(rideId: string | undefined): void {
    if (rideId) {
      this.router.navigate(['/manager/ride-detail', rideId]).then(() => {
        window.scrollTo(0, 0);
      });
    } else {
      console.warn('Ride ID is undefined. Navigation aborted.');
    }
  }
  formatAddress(address?: Address): string {
    if (!address) return '';
    const parts = [
      address.street,
      address.locality
    ].filter(Boolean);
    return parts.join(', ');
  }

  rideDuration(start: Date, end: Date): number {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    return parseFloat(((endTime - startTime) / 3600000).toFixed(2));
  }
  get orderedTaxisByHoursDesc() {
    return this.subtotals?.taxis?.slice().sort((a, b) => b.totalHours - a.totalHours);
  }

  get orderedDriversByHoursDesc() {
    return this.subtotals?.drivers?.slice().sort((a, b) => b.totalHours - a.totalHours);
  }
  get orderedTaxiRidesByDurationDesc() {
    return this.taxiSubTotals?.rides?.slice().sort((a, b) => this.rideDuration(b.timePeriod.start, b.timePeriod.end) - this.rideDuration(a.timePeriod.start, a.timePeriod.end));
  }

  get orderedDriverRidesByDurationDesc() {
    return this.driverSubTotals?.rides?.slice().sort((a, b) => this.rideDuration(b.timePeriod.start, b.timePeriod.end) - this.rideDuration(a.timePeriod.start, a.timePeriod.end));
  }
}
