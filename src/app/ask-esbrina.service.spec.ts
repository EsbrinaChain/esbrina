import { TestBed } from '@angular/core/testing';

import { AskEsbrinaService } from './ask-esbrina.service';

describe('AskEsbrinaService', () => {
  let service: AskEsbrinaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AskEsbrinaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
