import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DriverService } from '../../services/driver/driver.service';
import { DriverSessionService } from '../../services/sessions/driver-session/driver-session.service';
import { Driver } from '../../interfaces/driver';

@Component({
  selector: 'app-driver-login',
  standalone: false,
  templateUrl: './driver-login.component.html',
  styleUrl: './driver-login.component.css'
})
export class DriverLoginComponent implements OnInit {

  nifInput: string = '';
  drivers: Driver[] = [];
  selectedNif: string = '';

  constructor(
    private driverService: DriverService,
    private router: Router,
    private driverSessionService: DriverSessionService
  ) { }

  ngOnInit() {
    this.driverService.getDrivers().subscribe(list => {
      this.drivers = list.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    });
  }

  login() {
    const nif = this.selectedNif?.trim() || this.nifInput.trim();
    const nifRegex = /^\d{9}$/;
    if (!nifRegex.test(nif)) {
      alert('NIF must have 9 digits.');
      return;
    }

    // verificar se driver realmente existe
    const foundDriver = this.drivers.find(driver => driver.nif === nif);
    if (!foundDriver) {
      alert('Driver with this NIF does not exist.');
      return;
    }

    this.driverSessionService.setDriver(foundDriver);
    this.router.navigate(['/driver/dashboard']);
  }

  goBack() {
    this.router.navigate(['/']);
  }

}
