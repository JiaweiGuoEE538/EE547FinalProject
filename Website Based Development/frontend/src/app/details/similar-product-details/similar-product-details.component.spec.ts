import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimilarProductDetailsComponent } from './similar-product-details.component';

describe('SimilarProductDetailsComponent', () => {
  let component: SimilarProductDetailsComponent;
  let fixture: ComponentFixture<SimilarProductDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SimilarProductDetailsComponent]
    });
    fixture = TestBed.createComponent(SimilarProductDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
