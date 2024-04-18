import { TestBed } from '@angular/core/testing';

import { FavoriteIconService } from './favorite-icon.service';

describe('FavoriteIconService', () => {
  let service: FavoriteIconService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoriteIconService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
