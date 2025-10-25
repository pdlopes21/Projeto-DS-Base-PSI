import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtotalTimeComponent } from './subtotal-time.component';

describe('SubtotalTimeComponent', () => {
  let component: SubtotalTimeComponent;
  let fixture: ComponentFixture<SubtotalTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubtotalTimeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubtotalTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
