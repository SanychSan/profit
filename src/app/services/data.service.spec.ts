import { TestBed } from '@angular/core/testing';

import { SpotService } from './spot.service';

describe('DataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SpotService = TestBed.inject(SpotService);
    expect(service).toBeTruthy();
  });
});
