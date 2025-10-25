import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manager-login',
  standalone: false,
  templateUrl: './manager-login.component.html',
  styleUrl: './manager-login.component.css'
})
export class ManagerLoginComponent {
  username: string = '';
  password: string = '';

  constructor(private router: Router) { }

  login() {
    this.router.navigate(['/manager/dashboard']);
  }
}
