import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerPriceSettingsComponent } from './price-settings.component';

describe('ManagerPriceSettingsComponent', () => {
  let component: ManagerPriceSettingsComponent;
  let fixture: ComponentFixture<ManagerPriceSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerPriceSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerPriceSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
