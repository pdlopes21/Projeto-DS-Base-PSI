import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxiFormsComponent } from './taxi-forms.component';

describe('TaxiFormsComponent', () => {
  let component: TaxiFormsComponent;
  let fixture: ComponentFixture<TaxiFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaxiFormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxiFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
