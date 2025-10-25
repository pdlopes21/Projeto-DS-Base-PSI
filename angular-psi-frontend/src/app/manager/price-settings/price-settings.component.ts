import { Component } from '@angular/core';
import { PriceService } from '../../services/price/price.service';

@Component({
  selector: 'app-price-forms',
  standalone: false,
  templateUrl: './price-settings.component.html',
  styleUrls: ['./price-settings.component.css'],
})

export class ManagerPriceSettingsComponent {
  price = {
    taxiType: '',
    pricePerMinute: 0
  };

  nightTimeIncrease: number = 0;
  nightTimeIncreaseInput: number = 0; 

  calc = {
    taxiType: '',
    start: '',
    end: '',
    cost: 0
  };  

  prices: any[] = [];
  taxiTypes: string[] = ['standard', 'luxury'];

  constructor(private priceService: PriceService) {}

  ngOnInit() {
    this.loadPrices();
    this.loadNightIncrease();
  }

  loadPrices() {
    this.priceService.getPrices().subscribe((res) => {
      this.prices = res.map((price) => ({
        ...price,
        pricePerMinute: Number(price.pricePerMinute),
      }));
    });
  }

  loadNightIncrease() {
    this.priceService.getNightIncrease().subscribe(value => {
      this.nightTimeIncrease = value;
      this.nightTimeIncreaseInput = value;
    });
  }

  onSubmitPrice(): void {
    const { taxiType, pricePerMinute } = this.price;
  
    if (!taxiType || pricePerMinute <= 0) {
      alert('Price per minute must be a positive number.');
      return;
    }
  
    this.priceService.update(this.price).subscribe({
      next: (updatedPrice) => {
        alert(`Sucessfully updated price for taxi type: ${updatedPrice.taxiType}`);
        this.loadPrices();
      },
      error: (err) => {
        console.error(err);
        alert('Error when updating the price.');
      }
    });
  }
  
  onSubmitNightIncrease(): void {
    if (this.nightTimeIncreaseInput < 0 || this.nightTimeIncreaseInput > 100) {
      alert('Night-time increase must be between 0 and 100.');
      return;
    }

    this.priceService.updateNightIncrease(this.nightTimeIncreaseInput).subscribe({
        next: () => {
          alert('Night-time increase successfully updated.');
          this.loadNightIncrease();
        },
      error: (err) => {
        console.error(err);
        alert('Error when updating the night-time increase.');
      }
    });
  }

  calculate(): void {
    const { taxiType, start, end } = this.calc;
  
    if (!taxiType || !start || !end) {
      alert('All fields must be entered.');
      return;
    }
  
    this.priceService.getPrice(taxiType).subscribe({
      next: (priceConfig) => {
        const cost = computeTripCost(start, end, {
          pricePerMinute: Number(priceConfig.pricePerMinute),
          nightTimeIncrease: Number(this.nightTimeIncrease),
        });
  
        this.calc.cost = cost;
      },
      error: (err) => {
        console.error(err);
        alert('Error when obtaining the price for the selected taxi.');
      }
    });
  }  
}

export function computeTripCost(
  start: string,
  end: string,
  priceConfig: { pricePerMinute: number; nightTimeIncrease: number }
): number {
  if (!priceConfig) {
    console.error('Price settings not found.');
    return 0;
  }

  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);

  if ([h1, m1, h2, m2].some((n) => isNaN(n))) {
    console.error('Invalid timespan.');
    return 0;
  }

  let t1 = h1 * 60 + m1;
  let t2 = h2 * 60 + m2;

  if (t2 <= t1) t2 += 24 * 60;

  let total = 0;

  for (let t = t1; t < t2; t++) {
    const minuteOfDay = t % (24 * 60);
    const isNight = minuteOfDay >= 21 * 60 || minuteOfDay < 6 * 60;

    const multiplier = isNight ? 1 + priceConfig.nightTimeIncrease / 100 : 1;

    const costThisMinute = priceConfig.pricePerMinute * multiplier;

    total += costThisMinute;
  }

  return parseFloat(total.toFixed(2));
}

