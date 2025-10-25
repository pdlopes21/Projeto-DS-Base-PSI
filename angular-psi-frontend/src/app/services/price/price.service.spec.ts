import { TestBed } from '@angular/core/testing';

import { PriceService } from './price.service';

describe('PriceService', () => {
  let price: PriceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    price = TestBed.inject(PriceService);
  });

  it('should be created', () => {
    expect(price).toBeTruthy();
  });
});
