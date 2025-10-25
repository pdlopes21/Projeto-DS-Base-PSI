import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-manager-main-page',
  standalone: false,
  templateUrl: './manager-main-page.component.html',
  styleUrls: ['./manager-main-page.component.css']
})
export class ManagerMainPageComponent {
  sidebarOpen = window.innerWidth > 600;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebarIfMobile() {
    if (window.innerWidth <= 600) {
      this.sidebarOpen = false;
    }
  }

  @HostListener('window:resize', [])
  onResize() {
    if (window.innerWidth > 600) {
      this.sidebarOpen = true;
    }
  }

  logout() {
    window.location.href = '/login';
  }

  title = 'G4m3r T4x1s - Manager View';
}

