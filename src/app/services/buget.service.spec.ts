import { TestBed } from '@angular/core/testing';

import { BugetService } from './buget.service';

describe('BugetService', () => {
  let service: BugetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BugetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
