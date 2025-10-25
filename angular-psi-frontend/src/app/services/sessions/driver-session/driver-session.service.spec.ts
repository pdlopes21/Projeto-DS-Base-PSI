import { TestBed } from '@angular/core/testing';

import { DriverSessionService } from './driver-session.service';

describe('DriverSessionService', () => {
  let service: DriverSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DriverSessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
