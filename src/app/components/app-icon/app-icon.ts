import { Component, input } from '@angular/core';
export type IconName =
  | 'projects'
  | 'about'
  | 'skills'
  | 'experiences'
  | 'settings'
  | 'contact'
  | 'arrow'
  | 'minus'
  | 'close'
  | 'maximize'
  | 'restore';
@Component({
  selector: 'app-icon',
  template: `<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path [attr.d]="paths[name()]" />
  </svg>`,
  styles: `
    :host {
      display: inline-flex;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
  host: { 'aria-hidden': 'true' },
})
export class AppIcon {
  readonly name = input.required<IconName>();
  protected readonly paths: Record<IconName, string> = {
    projects: 'M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z',
    about: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5 21v-2a7 7 0 0 1 14 0v2',
    skills: 'm8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16',
    experiences: 'M3 7h18v13H3V7ZM8 7V4h8v3M3 12h18M10 12v3h4v-3',
    settings: 'M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6',
    contact: 'M3 5h18v14H3V5Zm0 1 9 7 9-7',
    arrow: 'M5 19 19 5M5 5h14v14',
    minus: 'M5 12h14',
    close: 'm6 6 12 12M6 18 18 6',
    maximize: 'M4 4h16v16H4V4Z',
    restore: 'M8 8h12v12H8V8ZM4 16V4h12',
  };
}
