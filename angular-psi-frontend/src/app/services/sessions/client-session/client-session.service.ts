import { Injectable } from '@angular/core';
import { TaxiOrder } from '../../../interfaces/taxiOrder';

@Injectable({
  providedIn: 'root'
})
export class ClientSessionService {

  private taxiOrder?: TaxiOrder;
  
    setTaxiOrder(taxiOrder: TaxiOrder): void {
      this.taxiOrder = taxiOrder;
      sessionStorage.setItem('taxiOrder', JSON.stringify(taxiOrder));
    }
  
    getTaxiOrder(): TaxiOrder | undefined {
      if (this.taxiOrder) return this.taxiOrder;
  
      const stored = sessionStorage.getItem('taxiOrder');
      if (stored) {
        this.taxiOrder = JSON.parse(stored);
        return this.taxiOrder;
      }
  
      return undefined;
    }
  
    clear(): void {
      this.taxiOrder = undefined;
    }
  
    isLoggedIn(): boolean {
      return !!this.taxiOrder;
    }

}
