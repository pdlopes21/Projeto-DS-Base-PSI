import { Component, OnInit } from '@angular/core';
import { Ride } from '../../interfaces/ride';
import { RideService } from '../../services/ride/ride.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Address } from '../../interfaces/address';
import { DriverService } from '../../services/driver/driver.service';
import { Driver } from '../../interfaces/driver';

@Component({
  selector: 'app-ride-details',
  standalone: false,
  templateUrl: './ride-details.component.html',
  styleUrl: './ride-details.component.css'
})
export class RideDetailsComponent implements OnInit {
  ride?: Ride;
  driverId: string | undefined;
  driver?: Driver;
  hasShifts: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private rideService: RideService,
    private driverService: DriverService,
    private location: Location,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getRide();
  }

  getRide(): void {
    const id = String(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.rideService.getRideById(id).subscribe((ride) => {
        this.ride = ride;
        this.driverId = ride.shift.driver;
        if (this.driverId) {
          this.driverService.getDriver(this.driverId).subscribe((driver) => {
            this.driver = driver
          });
        }
      })
    };
  }

  goBack(): void {
    this.location.back();
  }

  formatAddress(address?: Address): string {
    if (!address) return '';
    const parts = [
      address.street,
      address.locality
    ].filter(Boolean);
    return parts.join(', ');
  }
}
