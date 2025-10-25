import { Address } from "./address";
import { ClientInfo } from "./client_info";
import { Location } from "./location";
import { Shift } from "./shift";
import { TimePeriod } from "./timePeriod";

export interface Ride {
  _id?: string;
  client: ClientInfo;
  shift: Shift;
  timePeriod: TimePeriod;
  start: Location;
  end: Location;
  startAddress?: Address;
  endAddress?: Address;
  numberOfPeople: number;
  sequenceNumber: number;
  distanceKm: number;
  price: number;
}