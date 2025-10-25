import { Address } from "./address";
import { Location } from "./location";

export interface RideEnd {
  timePeriod: { end: Date };
  end: Location;
  endAddress?: Address;
}