import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverClientTaxiOrderComponent } from './driver-client-taxi-order.component';

describe('DriverClientTaxiOrderComponent', () => {
  let component: DriverClientTaxiOrderComponent;
  let fixture: ComponentFixture<DriverClientTaxiOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverClientTaxiOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverClientTaxiOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
