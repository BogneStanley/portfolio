import { SocialLinks } from '../social-links/social-links';
import { BrandMark } from '../brand-mark/brand-mark';
import { Component, computed, DestroyRef, inject, input, output, signal } from '@angular/core';
import { ProjectCard } from '../project-card/project-card';
import { PortfolioChat } from '../portfolio-chat/portfolio-chat';
import { SettingsPanel } from '../settings-panel/settings-panel';
import { AppIcon } from '../app-icon/app-icon';
import {
  PROFILE,
  PROJECTS,
  SKILLS,
  EXPERIENCES,
  EDUCATION,
  ProjectFilter,
  WindowId,
} from '../../data/portfolio';
@Component({
  selector: 'app-window-content',
  imports: [ProjectCard, AppIcon, SettingsPanel, PortfolioChat, BrandMark, SocialLinks],
  templateUrl: './window-content.html',
  styleUrls: ['./window-content.scss', './window-profile.scss'],
  host: { '[class.chat-content]': "section() === 'chat'" },
})
export class WindowContent {
  readonly section = input.required<WindowId>();
  readonly contactRequested = output<void>();
  protected readonly profile = PROFILE;
  protected readonly projects = PROJECTS;
  protected readonly skills = SKILLS;
  protected readonly experiences = EXPERIENCES;
  protected readonly education = EDUCATION;
  protected readonly filters: { value: ProjectFilter; label: string }[] = [
    { value: 'all', label: 'Tous les projets' },
    { value: 'mobile', label: 'Applications mobiles' },
    { value: 'web', label: 'Applications web' },
    { value: 'package', label: 'Packages' },
    { value: 'media', label: 'Podcast' },
    { value: 'learning', label: 'Formations' },
    { value: 'backend', label: 'API & backend' },
  ];
  protected readonly activeFilter = signal<ProjectFilter>('all');
  protected readonly filteredProjects = computed(() => {
    const filter = this.activeFilter();
    return filter === 'all'
      ? this.projects
      : this.projects.filter((project) => project.category === filter);
  });
  protected readonly copied = signal(false);
  private copyTimeout?: ReturnType<typeof setTimeout>;
  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.copyTimeout));
  }
  protected async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.profile.email);
      this.copied.set(true);
      clearTimeout(this.copyTimeout);
      this.copyTimeout = setTimeout(() => this.copied.set(false), 2500);
    } catch {
      this.copied.set(false);
    }
  }
}
