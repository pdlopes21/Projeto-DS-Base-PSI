import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerMainPageComponent } from './manager-main-page.component';

describe('ManagerMainPageComponent', () => {
  let component: ManagerMainPageComponent;
  let fixture: ComponentFixture<ManagerMainPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerMainPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerMainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
