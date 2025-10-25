import { ClientInfo } from "./client_info";
import { Location } from "./location";
import { Offer } from "./offer";
import { Address } from "./address";

export interface TaxiOrder {
    _id?: string;
    client: ClientInfo;
    location: Location;
    locationAddress?: Address;
    destination: Location;
    destinationAddress?: Address;
    numberOfPeople: number; 
    status: 'pending' | 'accepted' | 'confirmed' | 'rejected' | 'canceled' | 'driverArrived';
    comfortLevel: 'standard' | 'luxury';
    offer?: Offer;
}