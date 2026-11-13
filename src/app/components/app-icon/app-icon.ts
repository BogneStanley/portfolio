import { Component, input } from '@angular/core';
export type IconName =
  | 'chat'
  | 'linkedin'
  | 'github'
  | 'send'
  | 'restart'
  | 'projects'
  | 'about'
  | 'skills'
  | 'experiences'
  | 'settings'
  | 'contact'
  | 'arrow'
  | 'minus'
  | 'close'
  | 'back'
  | 'maximize'
  | 'restore'
  | 'sun'
  | 'moon'
  | 'system'
  | 'exit-fullscreen';
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
    linkedin: 'M3 3h18v18H3V3ZM7 10v7m0-10v.01M11 17v-7m0 3a3 3 0 0 1 6 0v4',
    github:
      'M9 19c-4 1-4-2-6-2m12 5v-3a4 4 0 0 0-1-3c3-.3 6-1.5 6-6a5 5 0 0 0-1.5-3.5 5 5 0 0 0-.1-3.5S17 1.5 15 3a12 12 0 0 0-6 0C7 1.5 5.6 2 5.6 2a5 5 0 0 0-.1 3.5A5 5 0 0 0 4 9c0 4.5 3 5.7 6 6a4 4 0 0 0-1 3v4',
    chat: 'M4 4h16v12H9l-5 4V4ZM8 8h8m-8 4h5',
    send: 'M12 20V4m-6 6 6-6 6 6',
    restart: 'M4 9a8 8 0 1 1 0 6M4 3v6h6',
    projects: 'M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z',
    about: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5 21v-2a7 7 0 0 1 14 0v2',
    skills: 'm8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16',
    experiences: 'M3 7h18v13H3V7ZM8 7V4h8v3M3 12h18M10 12v3h4v-3',
    settings: 'M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6',
    contact: 'M3 5h18v14H3V5Zm0 1 9 7 9-7',
    arrow: 'M5 19 19 5M5 5h14v14',
    minus: 'M5 12h14',
    close: 'm6 6 12 12M6 18 18 6',
    back: 'M15 18l-6-6 6-6',
    maximize: 'M4 4h16v16H4V4Z',
    sun: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',
    moon: 'M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z',
    system: 'M3 4h18v13H3V4Zm5 17h8m-4-4v4',
    'exit-fullscreen': 'M9 3v6H3m12-6v6h6M9 21v-6H3m12 6v-6h6',
    restore: 'M8 8h12v12H8V8ZM4 16V4h12',
  };
}
