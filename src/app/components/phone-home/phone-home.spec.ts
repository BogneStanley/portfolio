import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { PhoneHome } from './phone-home';
import { APPLICATIONS, WindowId } from '../../data/portfolio';

describe('Phone home screen', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('opens each application and exposes the theme and immersive controls', () => {
    const fixture = TestBed.createComponent(PhoneHome);
    fixture.componentRef.setInput('time', '09:41');
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('time')?.textContent).toBe('09:41');
    const opened: WindowId[] = [];
    fixture.componentInstance.applicationOpened.subscribe((id) => opened.push(id));
    const buttons = root.querySelectorAll<HTMLButtonElement>('.phone-app');
    expect(buttons.length).toBe(APPLICATIONS.length);
    for (const button of buttons) button.click();
    expect(opened).toEqual(APPLICATIONS.map((app) => app.id));
    let toggled = false;
    fixture.componentInstance.themeToggled.subscribe(() => (toggled = true));
    root.querySelector<HTMLButtonElement>('[aria-label="Activer le thème clair"]')!.click();
    expect(toggled).toBe(true);
    fixture.componentRef.setInput('immersive', true);
    fixture.detectChanges();
    expect(root.querySelector('[aria-label="Quitter le mode immersif"]')).not.toBeNull();
  });
});
