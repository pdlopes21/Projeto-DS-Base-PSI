import { Component } from '@angular/core';
import { Driver } from '../../interfaces/driver';
import { DriverService } from '../../services/driver/driver.service';
import { Address } from '../../interfaces/address';
import { PostalCodeService } from '../../services/postal-code/postalCode.service';

@Component({
  selector: 'app-driver-forms',
  standalone: false,
  templateUrl: './driver-forms.component.html',
  styleUrl: './driver-forms.component.css',
})
export class ManagerDriverFormsComponent {
  address: Address = {
    street: '',
    postalCode: '',
    doorNumber: '',
    locality: '',
  };

  driver: Driver = {
    nif: '',
    name: '',
    driversLicense: '',
    address: this.address,
    birthYear: 0,
    gender: 'male',
  };

  constructor(
    private driverService: DriverService,
    private postalCodeService: PostalCodeService
  ) {}

  onSubmitPostalCode(): void {
    const postalCodeInput = (
      document.getElementById('postalCode') as HTMLInputElement
    ).value.trim();
    const [cp4, cp3] = postalCodeInput.split('-');

    if (!/^[0-9]{4}-[0-9]{3}$/.test(postalCodeInput)) {
      alert('Postal code must be in format: 1234-567.');
      this.address.locality = ''; // Limpa a localidade se o código postal for inválido
      return;
    }

    this.postalCodeService.getPostalCodeInfo(cp4, cp3).subscribe({
      next: (data: any) => {
        this.address.locality = data[0]?.localidade?.trim() || '';
        if (!this.address.locality) {
          alert('Locality for the given postal code could not be found.');
        }
      },
      error: (err: Error) => {
        console.error(err);
        this.address.locality = ''; // Limpa a localidade em caso de erro
        alert('Error searching for the postal code.');
      },
    });
  }

  onSubmitDriver(): void {
    // primeiro verificar os campos do endereco

    var street = (
      document.getElementById('street') as HTMLInputElement
    ).value.trim();
    var postalCode = (
      document.getElementById('postalCode') as HTMLInputElement
    ).value.trim();
    var doorNumber = (
      document.getElementById('doorNumber') as HTMLInputElement
    ).value.trim();

    if (!street || !postalCode || !doorNumber) {
      alert('All fields must be entered.');
      return;
    }

    var postalCodeRegex = /^[0-9]{4}-[0-9]{3}$/;
    if (!postalCodeRegex.test(postalCode)) {
      alert('Postal code must be in format: 1234-567.');
      return;
    }
    var doorNumberRegex = /^[A-Za-z0-9]{1,10}$/;
    if (!doorNumberRegex.test(doorNumber)) {
      alert(
        'Door number must be alphanumeric characters with length 1-10.'
      );
      return;
    }

    this.address = {
      street,
      postalCode,
      doorNumber,
      locality : this.address.locality,
    };

    // verificar os campos do motorista
    var nif = (document.getElementById('nif') as HTMLInputElement).value.trim();
    var name = (
      document.getElementById('name') as HTMLInputElement
    ).value.trim();
    var birthYear = (
      document.getElementById('birthYear') as HTMLInputElement
    ).value.trim();
    var driversLicense = (
      document.getElementById('driversLicense') as HTMLInputElement
    ).value.trim();

    if (!nif || !name || !birthYear || !driversLicense || !this.driver.gender) {
      alert('All fields must be entered.');
      return;
    }

    var nifRegex = /^\d{9}$/;
    if (!nifRegex.test(nif)) {
      alert('NIF must contain 9 digits.');
      return;
    }
    var licenseRegex = /^[A-Z0-9]{1,12}$/;
    if (!licenseRegex.test(driversLicense)) {
      alert('License must only contain capital and numeric characters.');
      return;
    }

    const yearNum = Number(birthYear);
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

    this.driver = {
      nif,
      name,
      driversLicense,
      address: this.address,
      birthYear: yearNum,
      gender: this.driver.gender,
    };

    // campos de ambos ok: criar o driver com o endereco associado
    this.driverService.addDriver(this.driver).subscribe({
      next: (createdDriver: Driver) => {
        alert(`Driver successfuly created, nif: ${createdDriver.nif}`);
        window.location.reload();
      },
      error: (err) => {
        console.error(err);
        const serverMsg = err.error?.message || 'Error creating driver.';
        alert(serverMsg);
      },
    });
  }
}
