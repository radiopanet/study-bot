import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaperUpload } from './paper-upload';

describe('PaperUpload', () => {
  let component: PaperUpload;
  let fixture: ComponentFixture<PaperUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaperUpload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaperUpload);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
