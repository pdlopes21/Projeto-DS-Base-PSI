import { Taxi } from "./taxi";
import { Driver } from "./driver";
import { Location } from "./location";

export interface Offer {
  driver: Driver;
  taxi: Taxi;
  location: Location;
  distance: number;
  price: number;
}