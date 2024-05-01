import { TestBed } from '@angular/core/testing';

import { AuctionStateService } from './auction-state.service';

describe('AuctionStateService', () => {
  let service: AuctionStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuctionStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
