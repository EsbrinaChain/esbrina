import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestigioComponent } from './prestigio.component';

describe('PrestigioComponent', () => {
  let component: PrestigioComponent;
  let fixture: ComponentFixture<PrestigioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrestigioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrestigioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
