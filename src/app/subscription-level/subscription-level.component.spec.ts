import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionLevelComponent } from './subscription-level.component';

describe('SubscriptionLevelComponent', () => {
  let component: SubscriptionLevelComponent;
  let fixture: ComponentFixture<SubscriptionLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscriptionLevelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
