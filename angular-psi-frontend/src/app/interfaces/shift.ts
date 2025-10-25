import { Taxi } from "./taxi";
import { TimePeriod } from "./timePeriod";

export interface Shift {
    _id?: string;
    driver: string;
    taxi: Taxi;
    timePeriod: TimePeriod;
}