import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerDriversComponent } from './drivers.component';

describe('ManagerDriversComponent', () => {
  let component: ManagerDriversComponent;
  let fixture: ComponentFixture<ManagerDriversComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerDriversComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerDriversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
