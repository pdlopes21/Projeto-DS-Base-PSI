import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartRideComponent } from './start-ride.component';

describe('StartRideComponent', () => {
  let component: StartRideComponent;
  let fixture: ComponentFixture<StartRideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartRideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartRideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
