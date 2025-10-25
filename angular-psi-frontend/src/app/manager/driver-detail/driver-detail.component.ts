import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { Driver } from '../../interfaces/driver';
import { DriverService } from '../../services/driver/driver.service';

@Component({
  selector: 'app-driver-detail',
  standalone: false,
  templateUrl: './driver-detail.component.html',
  styleUrls: ['./driver-detail.component.css'],
})
export class ManagerDriverDetailComponent implements OnInit {
  driver?: Driver;
  hasShifts: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private driverService: DriverService,
    private location: Location,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getDriver();
  }

  getDriver(): void {
    const id = String(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.driverService.getDriver(id).subscribe((driver) => {
        this.driver = driver;
        // Só depois de obter o driver, buscar os shifts
        this.driverService.driverHasShifts(this.driver?._id!).subscribe(exists => {
          this.hasShifts = exists;
        });
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  goToEditDriver() {
    this.router.navigate(['manager/driver-edit', this.driver!._id]);
  }

  removeDriver() {
    if (!this.hasShifts) {
      const confirmed = window.confirm(
        'Are you sure you want to delete this driver?'
      );
      if (confirmed) {
        this.driverService.deleteDriver(this.driver!).subscribe(() => {
          alert('Driver deleted!');
          this.router.navigate(['/manager/drivers']);
        });
      }
    } else {
      alert('This driver has appointed shifts and cannot be deleted');
    }
  }
}
