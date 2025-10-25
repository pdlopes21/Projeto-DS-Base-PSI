import { Component, Input, input, OnInit } from '@angular/core';
import { Driver } from '../../interfaces/driver';
import { DriverService } from '../../services/driver/driver.service';
import { Address } from '../../interfaces/address';
import { PostalCodeService } from '../../services/postal-code/postalCode.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-driver-edit',
  standalone: false,
  templateUrl: './driver-edit.component.html',
  styleUrl: './driver-edit.component.css',
})
export class ManagerDriverEditComponent implements OnInit {
  @Input() driver_id?: String;


  driver: Driver | undefined

  constructor(
    private driverService: DriverService,
    private postalCodeService: PostalCodeService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    const id = String(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.driverService
        .getDriver(id)
        .subscribe((driver) => (this.driver! = driver));
    }
  }

  onSubmitPostalCode(): void {
    const postalCodeInput = (
      document.getElementById('postalCode') as HTMLInputElement
    ).value.trim();
    const [cp4, cp3] = postalCodeInput.split('-');

    if (!/^[0-9]{4}-[0-9]{3}$/.test(postalCodeInput)) {
      alert('Postal code must be in format: 1234-567.');
      this.driver!.address.locality = ''; // Limpa a localidade se o código postal for inválido
      return;
    }

    this.postalCodeService.getPostalCodeInfo(cp4, cp3).subscribe({
      next: (data: any) => {
        this.driver!.address.locality = data[0]?.localidade?.trim() || '';
        if (!this.driver!.address.locality) {
          alert('Locality for the given postal code could not be found.');
        }
      },
      error: (err: Error) => {
        console.error(err);
        this.driver!.address.locality = ''; // Limpa a localidade em caso de erro
        alert('Error searching for the postal code.');
      },
    });
  }

  onSubmitEdit(): void {
    // Verificações básicas
    if (!this.driver!.name || this.driver!.name.trim().length === 0) {
      alert('Name is required.');
      return;
    }
    if (
      !this.driver!.driversLicense ||
      this.driver!.driversLicense.trim().length === 0
    ) {
      alert('Drivers License is required.');
      return;
    }
    var nifRegex = /^\d{9}$/;
    if (!nifRegex.test(this.driver!.nif)) {
      alert('NIF must contain 9 digits.');
      return;
    }

    var licenseRegex = /^[A-Z0-9]{1,12}$/;
    if (!licenseRegex.test(this.driver!.driversLicense)) {
      alert('License must only contain capital and numeric characters.');
      return;
    }

    const yearNum = Number(this.driver!.birthYear);
    if (isNaN(yearNum)) {
      alert('Invalid birth year: must be a number.');
      return;
    }
    if (yearNum < 1900) {
      alert('Invalid birth year: must be after 1900.');
      return;
    }
    if (new Date().getFullYear() - yearNum < 18) {
      alert('Driver must be 18 years old or older.');
      return;
    }
    if (
      !this.driver!.gender ||
      (this.driver!.gender !== 'male' && this.driver!.gender !== 'female')
    ) {
      alert('Gender must be male or female.');
      return;
    }
    if (
      !this.driver!.address ||
      !this.driver!.address.postalCode ||
      !/^[0-9]{4}-[0-9]{3}$/.test(this.driver!.address.postalCode)
    ) {
      alert('Postal code must be in format: 1234-567.');
      return;
    }
    if (!this.driver!.address.street || !this.driver!.address.doorNumber) {
      alert('Street and Door Number are required.');
      return;
    }

    var doorNumberRegex = /^[A-Za-z0-9]{1,10}$/;
    if (!doorNumberRegex.test(this.driver!.address.doorNumber)) {
      alert('Door number must be alphanumeric characters with length 1-10.');
      return;
    }

    // Se não existe conflito, faz o update normalmente
    this.driverService.updateDriver(this.driver!).subscribe({
      next: () => {
        alert('Driver updated successfully!');
        this.router.navigate(['/manager/drivers']);
      },
      // avisar conflito
      error: (err) => {
        console.error(err);
        const serverMsg = err.error?.message || 'Error creating driver.';
        alert(serverMsg);
      },
    });
  }

  goBack(): void {
    this.location.back();
  }
}
