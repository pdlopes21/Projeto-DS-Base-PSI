import { Component } from '@angular/core';
import { Taxi } from '../../interfaces/taxi';
import { TaxiService } from '../../services/taxi/taxi.service';

@Component({
  selector: 'app-taxi-forms',
  standalone: false,
  templateUrl: './taxi-forms.component.html',
  styleUrl: './taxi-forms.component.css'
})
export class ManagerTaxiFormsComponent {

  taxi: Taxi = {
    licensePlate: '',
    brand: '',
    modelName: '',
    purchaseYear: new Date().getFullYear(),
    comfortLevel: '',
  };  
  carBrands: string[] = ['Ferrari', 'Toyota', 'BMW', 'Mercedes', 'Tesla'];
  carModels: string[] = ['F80', 'Camry', 'Model S', 'C-Class', 'M3'];

  constructor(private taxiService: TaxiService) {}

  acquisition(): void {
    var licensePlate = (document.getElementById("licensePlate") as HTMLInputElement).value.trim();
    var purchaseYear = (document.getElementById("purchaseYear") as HTMLInputElement).value.trim();

    var licensePlateRegex = /^[a-zA-Z0-9]{2}-[a-zA-Z0-9]{2}-[a-zA-Z0-9]{2}$/;
    if (!licensePlateRegex.test(licensePlate)) {
      alert("License plate must be in the format: AA-00-AA");
      return;
    }

    if (!licensePlate || this.taxi.modelName == "" || this.taxi.brand == "" || !purchaseYear) {
      alert("All fields must be entered");
      return
    }

    const yearNum = Number(purchaseYear);
    if (isNaN(yearNum)) {
      alert("Invalid purchase year: must be a number.");
      return;
    }
    if (yearNum > new Date().getFullYear()) {
      alert("Invalid purchase year: cannot be greater than the current year.");
      return;
    }
    if (yearNum < 1886) {
      alert("Invalid purchase year: cannot be earlier than 1886.");
      return;
    }

    this.taxi = {
      licensePlate,
      brand: this.taxi.brand,
      modelName: this.taxi.modelName,
      purchaseYear: yearNum,
      comfortLevel: this.taxi.comfortLevel,
    };

    this.taxiService.addTaxi(this.taxi).subscribe({
      next: (createdTaxi) => {
        alert(`Taxi sucessfully created: ${createdTaxi.licensePlate}`);
        window.location.reload();
      },
      error: (err) => {
        console.error(err);
        const serverMsg = err.error?.message || 'Error creating taxi.';
        alert(serverMsg);
      }
    });
  }
}