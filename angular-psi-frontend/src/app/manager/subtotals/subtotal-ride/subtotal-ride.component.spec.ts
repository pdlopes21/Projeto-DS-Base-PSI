import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtotalRideComponent } from './subtotal-ride.component';

describe('SubtotalRideComponent', () => {
  let component: SubtotalRideComponent;
  let fixture: ComponentFixture<SubtotalRideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubtotalRideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubtotalRideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
