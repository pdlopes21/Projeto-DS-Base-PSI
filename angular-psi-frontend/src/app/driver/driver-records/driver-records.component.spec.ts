import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverRecordsComponent } from './driver-records.component';

describe('DriverRecordsComponent', () => {
  let component: DriverRecordsComponent;
  let fixture: ComponentFixture<DriverRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverRecordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
