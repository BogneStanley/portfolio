import { Component, computed, input, output } from '@angular/core';
import { APPLICATIONS, PROFILE, WindowId } from '../../data/portfolio';
import { AppIcon } from '../app-icon/app-icon';
import { BrandMark } from '../brand-mark/brand-mark';

@Component({
  selector: 'app-phone-home',
  imports: [AppIcon, BrandMark],
  templateUrl: './phone-home.html',
  styleUrl: './phone-home.scss',
})
export class PhoneHome {
  readonly time = input.required<string>();
  readonly dark = input(true);
  readonly immersive = input(false);
  readonly applicationOpened = output<WindowId>();
  readonly themeToggled = output<void>();
  readonly immersionExited = output<void>();
  protected readonly applications = APPLICATIONS;
  protected readonly profile = PROFILE;
  private readonly dateFormat = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  protected readonly date = computed(() => {
    this.time();
    return this.dateFormat.format(new Date());
  });
}
