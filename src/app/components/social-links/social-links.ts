import { Component, input } from '@angular/core';
import { SOCIAL_PROFILES } from '../../data/portfolio';
import { AppIcon, IconName } from '../app-icon/app-icon';

@Component({
  selector: 'app-social-links',
  imports: [AppIcon],
  template: `<nav aria-label="Réseaux professionnels">
    @for (link of links; track link.icon) {
      @if (link.href) {
        <a
          [href]="link.href"
          target="_blank"
          rel="noopener noreferrer"
          [attr.aria-label]="'Mon profil ' + link.label + ' (nouvel onglet)'"
          [title]="link.label"
        >
          <app-icon [name]="link.icon" />
          @if (!compact()) {
            <span>{{ link.label }}</span>
          }
        </a>
      }
    }
  </nav>`,
  styles: `
    :host {
      display: block;
      margin: 12px 0;
    }
    :host(.compact) {
      margin: 0;
    }
    nav {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 36px;
      padding: 8px 10px;
      border-radius: 8px;
      color: var(--muted);
      font-size: calc(12px * var(--text-scale));
      text-decoration: none;
      pointer-events: auto;
    }
    a:hover {
      color: var(--accent);
      background: var(--accent-soft);
    }
    app-icon {
      width: 18px;
      height: 18px;
    }
    :host(.compact) a {
      width: 36px;
      padding: 8px;
    }
  `,
  host: { '[class.compact]': 'compact()' },
})
export class SocialLinks {
  readonly compact = input(false);
  protected readonly links: { icon: IconName; label: string; href: string | undefined }[] = [
    { icon: 'linkedin', label: 'LinkedIn', href: SOCIAL_PROFILES.linkedin },
    { icon: 'github', label: 'GitHub', href: SOCIAL_PROFILES.github },
  ];
}
