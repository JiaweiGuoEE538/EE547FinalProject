import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultWishlistButtonComponent } from './result-wishlist-button.component';

describe('ResultWishlistButtonComponent', () => {
  let component: ResultWishlistButtonComponent;
  let fixture: ComponentFixture<ResultWishlistButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResultWishlistButtonComponent]
    });
    fixture = TestBed.createComponent(ResultWishlistButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
