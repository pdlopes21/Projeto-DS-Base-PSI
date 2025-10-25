import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from '../../services/report/report.service';
import { ReportTotals, ReportSubtotals } from '../../interfaces/report';
import { Router } from '@angular/router';
import { TimePeriod } from '../../interfaces/timePeriod';


@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class ManagerDashboardComponent implements OnInit {

  pressed: boolean = false;
  startDate: Date | undefined;
  endDate: Date | undefined;
  timePeriod!: TimePeriod;
  startTime: string | undefined;
  endTime: string | undefined;

  totals?: ReportTotals;
  subtotals?: ReportSubtotals;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reportService: ReportService
  ) { }

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

  reloadWithNewTime(): void {
    if (!this.startDate || !this.startTime || !this.endDate || !this.endTime) {
      alert('Please Fill all Dates and Hours');
      return;
    }

    const startIso = `${this.startDate}T${this.startTime}`;
    const endIso = `${this.endDate}T${this.endTime}`;

    const timeStart = new Date(startIso);
    const timeEnd = new Date(endIso);


    if (isNaN(timeStart.getTime()) || isNaN(timeEnd.getTime())) {
      alert('Please Fill all Dates and Hours!');;
      return;
    }

    if (timeEnd < timeStart) {
      alert('End Hour/Date cant be before Start Hour/Date!');
      return;
    } 

    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.endTime.split(':').map(Number);

    const start = new Date(this.startDate);
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date(this.endDate);
    end.setHours(endHour, endMinute, 0, 0);

    const startString = `${timeStart.toLocaleDateString('sv-SE')}T${this.startTime}`;//para resolver o problema da 00:00
    const endString = `${timeEnd.toLocaleDateString('sv-SE')}T${this.endTime}`// 'sv-SE' retorna no formato que a gente quer

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        start: startString,
        end: endString
      },
      queryParamsHandling: 'merge'
    }).then(() => {
      // Força o reload da página após atualizar a URL
      location.reload();
    });
  }

  loadReportData(): void {
    this.reportService.getReportTotals(this.timePeriod).subscribe(t => this.totals = t);

    this.reportService.getReportSubtotals(this.timePeriod).subscribe(s => this.subtotals = s);
  }

  isPressed(): void {
    this.pressed = !this.pressed;
  }
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}