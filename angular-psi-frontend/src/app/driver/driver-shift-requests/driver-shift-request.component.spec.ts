import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverShiftRequestComponent } from './driver-shift-request.component';

describe('DriverShiftRequestComponent', () => {
  let component: DriverShiftRequestComponent;
  let fixture: ComponentFixture<DriverShiftRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverShiftRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverShiftRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
