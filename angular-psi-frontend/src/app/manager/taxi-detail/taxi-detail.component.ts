import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { Taxi } from '../../interfaces/taxi';
import { TaxiService } from '../../services/taxi/taxi.service';

@Component({
  selector: 'app-taxi-detail',
  standalone: false,
  templateUrl: './taxi-detail.component.html',
  styleUrl: './taxi-detail.component.css'
})
export class ManagerTaxiDetailComponent implements OnInit {
  taxi?: Taxi;
  hasShifts: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private taxiService: TaxiService,
    private location: Location,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.taxiService.getTaxi(id).subscribe(taxi => {
        this.taxi = { ...taxi };
        // ver se taxi foi requisitado para um turno
        this.taxiService.taxiHasShifts(this.taxi?._id!).subscribe(exists => {
          this.hasShifts = exists;
        });
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  editTaxi() {
    if (this.taxi && this.taxi.licensePlate) {
      this.router.navigate(['/manager/taxi-edit', this.taxi._id]);
    }
  }

  removeTaxi() {
    if (!this.taxi) return;
    if (this.hasShifts) {
      alert('The taxi has been used in a shift already and cannot be removed.');
      return;
    }
    if (confirm('Are you sure you want to delete this taxi?')) {
      this.taxiService.deleteTaxi(this.taxi._id!).subscribe({
        next: () => {
          alert('Taxi deleted!.');
          this.router.navigate(['/manager/taxis']);
        },
        error: err => {
          alert(err.error?.message || 'Error removing taxi');
        }
      });
    }
  }
}
