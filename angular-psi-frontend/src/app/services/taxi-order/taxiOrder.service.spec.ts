import { TestBed } from '@angular/core/testing';

import { TaxiOrderService } from './taxiOrder.service';

describe('TaxiOrderService', () => {
  let service: TaxiOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaxiOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
