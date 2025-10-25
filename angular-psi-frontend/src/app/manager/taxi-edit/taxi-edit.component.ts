import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Taxi } from '../../interfaces/taxi';
import { TaxiService } from '../../services/taxi/taxi.service';

@Component({
  selector: 'app-taxi-edit',
  standalone: false,
  templateUrl: './taxi-edit.component.html',
  styleUrls: ['./taxi-edit.component.css']
})
export class ManagerTaxiEditComponent implements OnInit {
  taxi: Taxi | undefined;
  hasRides: boolean = false;
  hasShifts: boolean = false;
  errorMsg = '';
  originalComfortLevel: string = '';

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
        this.originalComfortLevel = this.taxi.comfortLevel;

        this.taxiService.taxiHasRides(this.taxi?._id!).subscribe(exists => {
          this.hasRides = exists;
        });

        this.taxiService.taxiHasShifts(this.taxi?._id!).subscribe(exists => {
          this.hasShifts = exists;
        });
      });
    }
  }

  onSubmitEdit(): void {
    if (!this.taxi) return;

    if (this.taxi.licensePlate == "" || this.taxi.modelName == "" || this.taxi.brand == "" || this.taxi.purchaseYear == undefined) {
      alert("All fields must be entered");
      return
    }
    var licensePlateRegex = /^[a-zA-Z0-9]{2}-[a-zA-Z0-9]{2}-[a-zA-Z0-9]{2}$/;
    if (!licensePlateRegex.test(this.taxi.licensePlate)) {
      alert("License plate must be in the format: AA-00-AA");
      return;
    }
    const currentYear = new Date().getFullYear();
    if (this.taxi.purchaseYear > currentYear) {
      alert('Purchase year must be less than or equal to the current year.');
      return;
    }
    if (this.taxi.purchaseYear < 1886) {
      alert("Invalid purchase year: cannot be earlier than 1886.");
      return;
    }
    if (this.hasRides && this.taxi.comfortLevel !== this.originalComfortLevel) {
      alert('The comfort level cannot be edited because this taxi has already completed rides.');
      return;
    }

    this.taxiService.updateTaxi(this.taxi._id!, this.taxi).subscribe({
      next: () => {
        alert('Taxi successfully updated.');
        this.router.navigate(['/manager/taxis']);
      },
      error: err => {
        console.error(err);
        const serverMsg = err.error?.message || 'Error creating taxi.';
        alert(serverMsg);
      }
    });

  }

  removeTaxi(): void {
    if (!this.taxi) return;

    if (this.hasShifts) {
      alert('This taxi cannot be removed because it has been assigned to a shift.');
      return;
    }
    if (confirm('Are you sure you want to remove this taxi?')) {
      this.taxiService.deleteTaxi(this.taxi._id!).subscribe({
        next: () => {
          alert('Taxi successfully removed.');
          this.router.navigate(['/manager/taxis']);
        },
        error: err => {
          alert(err.error?.message || 'Error removing taxi');
        }
      });
    }
  }

  goBack(): void {
    this.location.back();
  }
}
