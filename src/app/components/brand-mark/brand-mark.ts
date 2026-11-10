import { Component } from '@angular/core';

@Component({
  selector: 'app-brand-mark',
  template: `<svg viewBox="0 0 292 380" fill="none" aria-hidden="true" focusable="false">
    <path
      class="monogram"
      fill-rule="evenodd"
      transform="translate(64 0) skewX(-10)"
      d="M26 28L60 12V154C79 138 102 132 130 132H165L152 160H130C85 160 60 173 60 199C60 221 81 226 121 226C182 226 210 250 210 290C210 335 176 356 113 356H26ZM60 255V326H112C157 326 178 315 178 290C178 263 162 255 122 255Z"
    />
    <path class="period" d="M236 324h32v32h-32z" />
  </svg>`,
  styles: `
    :host {
      display: inline-flex;
      width: 24px;
      height: 32px;
      flex-shrink: 0;
    }
    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
    .monogram {
      fill: var(--text, currentColor);
    }
    .period {
      fill: var(--accent, currentColor);
    }
  `,
  host: { 'aria-hidden': 'true' },
})
export class BrandMark {}
