import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Ride } from '../../interfaces/ride';
import { RideService } from '../../services/ride/ride.service';
import { GeoService } from '../../services/geo/geo.service';
import { Address } from '../../interfaces/address';

@Component({
  selector: 'app-driver-record-details',
  standalone: false,
  templateUrl: './driver-record-details.component.html',
  styleUrls: ['./driver-record-details.component.css']
})
export class DriverRecordDetailsComponent implements OnInit {
  @Input() record?: Ride;
  
  constructor(
    private route: ActivatedRoute,
    private rideService: RideService,
    private geoService : GeoService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.rideService.getRideById(id).subscribe(ride => {
        this.record = ride;
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/driver/records']);
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
