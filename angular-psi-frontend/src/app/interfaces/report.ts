import { Driver } from "./driver";
import { Ride } from "./ride";
import { Taxi } from "./taxi";

// pra alinea a) ------------------------
export interface ReportTotals {
  totalRides: number;
  totalHours: number;
  totalDistance: number;
}

// pra alinea b) ------------------------
export interface ReportSubtotals {
  drivers: SubtotalInfo[];
  taxis: SubtotalInfo[];
}

export interface SubtotalInfo {
  id: string;
  name: string;            // para driver.name ou taxi.licensePlate
  totalHours: number;
  totalRides: number;
  totalDistance: number;
}

// pra alinea c) ------------------------
export interface DriverSubtotals {
  driver: Driver;
  rides: Ride[];
}
export interface TaxiSubtotals {
  taxi: Taxi;
  rides: Ride[];
}
