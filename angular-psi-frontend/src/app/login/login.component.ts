import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  constructor(private router: Router) { }

  goToLogin(role: string): void {
    if (role === 'client') {
      this.router.navigate(['/client']);
    }
    else {
      this.router.navigate([`/login/${role}`]);
    }
  }
}
