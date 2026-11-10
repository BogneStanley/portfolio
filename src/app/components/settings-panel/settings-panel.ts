import { Component, inject, signal } from '@angular/core';
import { ACCENTS, PreferencesStore, Theme } from '../../settings/preferences';
import { WindowManager } from '../../windows/window-manager';
@Component({
  selector: 'app-settings-panel',
  templateUrl: './settings-panel.html',
  styleUrl: './settings-panel.scss',
})
export class SettingsPanel {
  protected readonly settings = inject(PreferencesStore);
  protected readonly accents = ACCENTS;
  protected readonly themes: { id: Theme; label: string; description: string }[] = [
    { id: 'dark', label: 'Sombre', description: 'Un bureau feutré.' },
    { id: 'light', label: 'Clair', description: 'Une interface lumineuse.' },
    { id: 'system', label: 'Automatique', description: 'Comme votre appareil.' },
  ];
  protected readonly message = signal('');
  private readonly manager = inject(WindowManager);
  protected setColor(event: Event): void {
    this.settings.update({ accent: (event.target as HTMLInputElement).value });
    this.message.set('Couleur d’accent appliquée.');
  }
  protected setScale(event: Event): void {
    this.settings.update({ textScale: Number((event.target as HTMLSelectElement).value) });
  }
  protected setMotion(event: Event): void {
    this.settings.update({ reducedMotion: (event.target as HTMLInputElement).checked });
  }
  protected setGrid(event: Event): void {
    this.settings.update({ showGrid: (event.target as HTMLInputElement).checked });
  }
  protected resetPreferences(): void {
    this.settings.reset();
    this.message.set('Les préférences par défaut ont été rétablies.');
  }
  protected resetWindows(): void {
    this.manager.resetPositions();
    this.message.set('Les fenêtres ont été réorganisées. Leur contenu est conservé.');
  }
}
