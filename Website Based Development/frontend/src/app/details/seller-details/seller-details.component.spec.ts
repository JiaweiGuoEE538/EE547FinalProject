import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerDetailsComponent } from './seller-details.component';

describe('SellerDetailsComponent', () => {
  let component: SellerDetailsComponent;
  let fixture: ComponentFixture<SellerDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SellerDetailsComponent]
    });
    fixture = TestBed.createComponent(SellerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
