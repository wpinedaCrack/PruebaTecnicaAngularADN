import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DnaInputComponent } from './dna-input.component';

describe('DnaInputComponent', () => {
  let component: DnaInputComponent;
  let fixture: ComponentFixture<DnaInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DnaInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DnaInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
