import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivedTaskdetailsComponent } from './archived-taskdetails.component';

describe('ArchivedTaskdetailsComponent', () => {
  let component: ArchivedTaskdetailsComponent;
  let fixture: ComponentFixture<ArchivedTaskdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchivedTaskdetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArchivedTaskdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
