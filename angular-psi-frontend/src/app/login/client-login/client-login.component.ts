import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientInfo } from '../../interfaces/client_info';

@Component({
  selector: 'app-client-login',
  standalone: false,
  templateUrl: './client-login.component.html',
  styleUrl: './client-login.component.css'
})
export class ClientLoginComponent {

  nifInput: string = '';
  clients: ClientInfo[] = [];
  selectedNif?: string;

  constructor(private router: Router) { }

  login() {
    const nif = this.selectedNif?.trim() || this.nifInput.trim();
    const nifRegex = /^\d{9}$/;
    if (!nifRegex.test(nif)) {
      alert('NIF must have 9 digits.');
      return;
    }

    this.router.navigate(['/client'], { queryParams: { nif } });
  }

  goBack() {
    this.router.navigate(['/']);
  }

}
