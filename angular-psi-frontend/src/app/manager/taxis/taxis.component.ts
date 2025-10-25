import { Component, OnInit } from '@angular/core';
import { Taxi } from '../../interfaces/taxi';
import { TaxiService } from '../../services/taxi/taxi.service';

@Component({
  selector: 'app-taxis',
  standalone: false,
  templateUrl: './taxis.component.html',
  styleUrl: './taxis.component.css'
})
export class ManagerTaxisComponent implements OnInit {

  taxis: Taxi[] = [];
  clicked = false;

  constructor(private taxiService: TaxiService){}

  ngOnInit(): void {
    this.getTaxis();
  }

  getTaxis(): void {
    this.taxiService.getTaxis().subscribe(taxis => this.taxis = taxis);
  }

  onClick(){
    this.clicked = !this.clicked;
  }

}

