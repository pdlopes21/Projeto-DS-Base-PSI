import { Address } from "./address";

export interface Driver {
    _id?: string;
    nif: string;               
    name: string;
    driversLicense: string;
    address: Address;
    birthYear: number;
    gender: 'male' | 'female';
  }
  