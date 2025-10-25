import { Component } from '@angular/core';
import { Driver } from '../../interfaces/driver';
import { DriverService } from '../../services/driver/driver.service';
import { MessageService } from '../../services/message/message.service';

@Component({
  selector: 'app-drivers',
  standalone: false,
  templateUrl: './drivers.component.html',
  styleUrl: './drivers.component.css'
})
export class ManagerDriversComponent {

  clicked = false;
  drivers: Driver[] = [];
  
    selectedDriver?: Driver;
  
  constructor(private driverService: DriverService) { }
  
    ngOnInit(): void {
      this.getDrivers();
    }
  
    getDrivers(): void {
      this.driverService.getDrivers().subscribe(drivers => this.drivers = drivers);
    }

    onClick(){
      this.clicked = !this.clicked;
    }
}
