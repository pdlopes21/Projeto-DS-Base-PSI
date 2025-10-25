import { Injectable } from '@angular/core';
import { Driver } from '../../../interfaces/driver';

@Injectable({
  providedIn: 'root'
})

export class DriverSessionService {
  private driver?: Driver;
  private taxiOrderId?: string;
  private activeShiftId?: string;

  setDriver(driver: Driver): void {
    this.driver = driver;
    sessionStorage.setItem('driver', JSON.stringify(driver));
  }

  getDriver(): Driver | undefined {
    if (this.driver) return this.driver;

    const stored = sessionStorage.getItem('driver');
    if (stored) {
      this.driver = JSON.parse(stored);
      return this.driver;
    }
    return undefined;
  }

  clearDriver(): void {
    this.driver = undefined;
    sessionStorage.removeItem('driver');
  }

  isLoggedIn(): boolean {
    return !!this.driver;
  }

  // metodos sobre taxiOrder
  setTaxiOrderId(id: string): void {
    this.taxiOrderId = id;
    sessionStorage.setItem('taxiOrderId', id);
  }

  getTaxiOrderId(): string | undefined {
    if (this.taxiOrderId) return this.taxiOrderId;
    const stored = sessionStorage.getItem('taxiOrderId');
    if (stored) {
      this.taxiOrderId = stored;
      return this.taxiOrderId;
    }
    return undefined;
  }

  clearTaxiOrderId(): void {
    this.taxiOrderId = undefined;
    sessionStorage.removeItem('taxiOrderId');
  }

  // metodos sobre activeShift
  setActiveShiftId(id: string): void {
    this.activeShiftId = id;
    sessionStorage.setItem('activeShiftId', id);
  }

  getActiveShiftId(): string | undefined {
    if (this.activeShiftId) return this.activeShiftId;
    const stored = sessionStorage.getItem('activeShiftId');
    if (stored) {
      this.activeShiftId = stored;
      return this.activeShiftId;
    }
    return undefined;
  }

  clearActiveShiftId(): void {
    this.activeShiftId = undefined;
    sessionStorage.removeItem('activeShiftId');
  }
}
