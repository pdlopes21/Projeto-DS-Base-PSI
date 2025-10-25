import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientWaitingComponent } from './client-waiting.component';

describe('ClientWaitingComponent', () => {
  let component: ClientWaitingComponent;
  let fixture: ComponentFixture<ClientWaitingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientWaitingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientWaitingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
