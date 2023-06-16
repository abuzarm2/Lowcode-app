import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OAComponent } from './oa.component';

describe('OAComponent', () => {
  let component: OAComponent;
  let fixture: ComponentFixture<OAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OAComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
