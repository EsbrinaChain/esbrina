import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletInComponent } from './wallet-in.component';

describe('WalletInComponent', () => {
  let component: WalletInComponent;
  let fixture: ComponentFixture<WalletInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletInComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WalletInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
