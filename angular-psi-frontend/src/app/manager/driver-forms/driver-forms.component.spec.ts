import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerDriverFormsComponent } from './driver-forms.component';

describe('ManagerDriverFormsComponent', () => {
  let component: ManagerDriverFormsComponent;
  let fixture: ComponentFixture<ManagerDriverFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerDriverFormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerDriverFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
