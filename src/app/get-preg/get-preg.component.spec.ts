import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetPregComponent } from './get-preg.component';

describe('GetPregComponent', () => {
  let component: GetPregComponent;
  let fixture: ComponentFixture<GetPregComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetPregComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GetPregComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
