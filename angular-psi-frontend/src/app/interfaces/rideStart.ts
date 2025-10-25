import { Address } from "./address";
import { ClientInfo } from "./client_info";
import { Location } from "./location";

export interface RideStart {
  client: ClientInfo;
  shift?: string;
  timePeriod: { start: Date };
  start: Location;
  startAddress?: Address;
  numberOfPeople: number;
  sequenceNumber: number;
  taxiOrder?: string;
}