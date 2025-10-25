import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverRecordDetailsComponent } from './driver-record-details.component';

describe('DriverRecordDetailsComponent', () => {
  let component: DriverRecordDetailsComponent;
  let fixture: ComponentFixture<DriverRecordDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverRecordDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverRecordDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
