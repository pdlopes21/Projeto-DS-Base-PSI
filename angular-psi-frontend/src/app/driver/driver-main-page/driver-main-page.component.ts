import { Component, HostListener, OnInit } from '@angular/core';
import { Taxi } from '../../interfaces/taxi';
import { Driver } from '../../interfaces/driver';
import { TaxiService } from '../../services/taxi/taxi.service';
import { DriverSessionService } from '../../services/sessions/driver-session/driver-session.service';

@Component({
  selector: 'app-driver-main-page',
  standalone: false,
  templateUrl: './driver-main-page.component.html',
  styleUrl: './driver-main-page.component.css',
})
export class DriverMainPageComponent implements OnInit {
  taxis: Taxi[] = [];
  driver?: Driver;
  title = 'G4m3r T4x1s - Driver View';

  constructor(private taxiService: TaxiService, private driverSession: DriverSessionService) {}

  ngOnInit(): void {
    this.driver = this.driverSession.getDriver();

    if (this.driver) {
      this.title = `G4m3r T4x1s - Welcome, ${this.driver.name}`;
    }

    this.getTaxis();
  }

  getTaxis(): void {
    this.taxiService.getTaxis().subscribe((taxis) => (this.taxis = taxis));
  }

  logout() {
    window.location.href = '/login';
  }

  sidebarOpen = window.innerWidth > 600;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebarIfMobile() {
    if (window.innerWidth <= 600) {
      this.sidebarOpen = false;
    }
  }

  @HostListener('window:resize', [])
  onResize() {
    if (window.innerWidth > 600) {
      this.sidebarOpen = true;
    }
  }
}
