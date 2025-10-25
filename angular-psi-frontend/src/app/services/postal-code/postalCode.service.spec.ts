import { TestBed } from '@angular/core/testing';

import { PostalCodeService } from './postalCode.service';

describe('PostalCodeService', () => {
  let postalCode: PostalCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    postalCode = TestBed.inject(PostalCodeService);
  });

  it('should be created', () => {
    expect(postalCode).toBeTruthy();
  });
});
