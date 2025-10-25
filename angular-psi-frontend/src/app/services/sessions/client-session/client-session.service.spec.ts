import { TestBed } from '@angular/core/testing';

import { ClientSessionService } from './client-session.service';

describe('ClientSessionService', () => {
  let service: ClientSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientSessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
