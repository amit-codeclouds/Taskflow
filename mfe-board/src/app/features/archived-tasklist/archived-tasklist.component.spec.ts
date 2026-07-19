import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivedTasklistComponent } from './archived-tasklist.component';

describe('ArchivedTasklistComponent', () => {
  let component: ArchivedTasklistComponent;
  let fixture: ComponentFixture<ArchivedTasklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchivedTasklistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArchivedTasklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
