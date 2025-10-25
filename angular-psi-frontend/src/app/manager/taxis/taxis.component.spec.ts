import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerTaxisComponent } from './taxis.component';

describe('ManagerTaxisComponent', () => {
  let component: ManagerTaxisComponent;
  let fixture: ComponentFixture<ManagerTaxisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerTaxisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerTaxisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
