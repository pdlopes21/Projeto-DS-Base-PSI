import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverShiftsComponent } from './driver-shifts.component';

describe('DriverShiftsComponent', () => {
  let component: DriverShiftsComponent;
  let fixture: ComponentFixture<DriverShiftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverShiftsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverShiftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
