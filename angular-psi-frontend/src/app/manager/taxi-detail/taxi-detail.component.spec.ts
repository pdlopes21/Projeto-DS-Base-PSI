import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerTaxiDetailComponent } from './taxi-detail.component';

describe('ManagerTaxiDetailComponent', () => {
  let component: ManagerTaxiDetailComponent;
  let fixture: ComponentFixture<ManagerTaxiDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerTaxiDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerTaxiDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
