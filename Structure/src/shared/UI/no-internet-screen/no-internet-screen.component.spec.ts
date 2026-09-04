import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoInternetScreenComponent } from './no-internet-screen.component';

describe('NoInternetScreenComponent', () => {
  let component: NoInternetScreenComponent;
  let fixture: ComponentFixture<NoInternetScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoInternetScreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoInternetScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
