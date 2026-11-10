import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DesktopWindow } from './desktop-window';

describe('DesktopWindow', () => {
  let component: DesktopWindow;
  let fixture: ComponentFixture<DesktopWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesktopWindow],
    }).compileComponents();

    fixture = TestBed.createComponent(DesktopWindow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
