import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerDriverDetailComponent } from './driver-detail.component';

describe('ManagerDriverDetailComponent', () => {
  let component: ManagerDriverDetailComponent;
  let fixture: ComponentFixture<ManagerDriverDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerDriverDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerDriverDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
