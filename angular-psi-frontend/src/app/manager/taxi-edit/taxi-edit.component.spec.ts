import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxiEditComponent } from './taxi-edit.component';

describe('TaxiEditComponent', () => {
  let component: TaxiEditComponent;
  let fixture: ComponentFixture<TaxiEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaxiEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxiEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
