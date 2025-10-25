import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../../../services/report/report.service';
import { TimePeriod } from '../../../interfaces/timePeriod';
import { DriverSubtotals, ReportSubtotals, TaxiSubtotals } from '../../../interfaces/report';
import { Address } from '../../../interfaces/address';

@Component({
  selector: 'app-subtotal-ride',
  standalone: false,
  templateUrl: './subtotal-ride.component.html',
  styleUrl: './subtotal-ride.component.css'
})
export class SubtotalRideComponent {
  pressed: boolean = false;
  startDate: Date | undefined;
  endDate: Date | undefined;
  timePeriod!: TimePeriod;
  startTime: string | undefined;
  endTime: string | undefined;

  subtotals?: ReportSubtotals;
  driverSubTotals?: DriverSubtotals
  taxiSubTotals?: TaxiSubtotals

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
    this.reportService.getReportSubtotals(this.timePeriod).subscribe(s => this.subtotals = s);
  }
  getMoreInfoDriver(index: number): void {
    this.openedIndexDriver = this.openedIndexDriver === index ? null : index;

    const drivers = this.orderedDriversByRidesDesc;

    if (this.openedIndexDriver !== null && this.subtotals?.drivers && drivers) {
      const driverId = drivers[this.openedIndexDriver].id;

      this.reportService.getDriverSubtotals(driverId, this.timePeriod)
        .subscribe(d => { this.driverSubTotals = d; });
    }
  }

  getMoreInfoTaxi(index: number): void {
    this.openedIndexTaxi = this.openedIndexTaxi === index ? null : index;

    const taxis = this.orderedTaxisByRidesDesc;

    if (this.openedIndexTaxi !== null && this.subtotals?.taxis && taxis) {
      const taxiId = taxis[this.openedIndexTaxi].id;

      this.reportService.getTaxiSubtotals(taxiId, this.timePeriod)
        .subscribe(t => { this.taxiSubTotals = t; });
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
  get orderedTaxisByRidesDesc() {
    return this.subtotals?.taxis?.slice().sort((a, b) => b.totalRides - a.totalRides);
  }

  get orderedDriversByRidesDesc() {
    return this.subtotals?.drivers?.slice().sort((a, b) => b.totalRides - a.totalRides);
  }

  get orderedTaxiRidesByEndDesc() {
    return this.taxiSubTotals?.rides?.slice().sort((a, b) => {
      const endA = a.timePeriod.end instanceof Date ? a.timePeriod.end.getTime() : new Date(a.timePeriod.end).getTime();
      const endB = b.timePeriod.end instanceof Date ? b.timePeriod.end.getTime() : new Date(b.timePeriod.end).getTime();
      return endB - endA;
    });
  }

  get orderedDriverRidesByEndDesc() {
    return this.driverSubTotals?.rides?.slice().sort((a, b) => {
      const endA = a.timePeriod.end instanceof Date ? a.timePeriod.end.getTime() : new Date(a.timePeriod.end).getTime();
      const endB = b.timePeriod.end instanceof Date ? b.timePeriod.end.getTime() : new Date(b.timePeriod.end).getTime();
      return endB - endA;
    });
  }
}
