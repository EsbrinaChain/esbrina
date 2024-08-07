import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetRespComponent } from './get-resp.component';

describe('GetRespComponent', () => {
  let component: GetRespComponent;
  let fixture: ComponentFixture<GetRespComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetRespComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GetRespComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
