import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtotalDistanceComponent } from './subtotal-distance.component';

describe('SubtotalDistanceComponent', () => {
  let component: SubtotalDistanceComponent;
  let fixture: ComponentFixture<SubtotalDistanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubtotalDistanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubtotalDistanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
