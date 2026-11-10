import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { DesktopWindow } from './components/desktop-window/desktop-window';


type ProjectCategory = 'frontend' | 'backend';
type ProjectFilter = 'all' | ProjectCategory;

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  category: ProjectCategory;
  image?: string;
  demoUrl?: string;
  repositoryUrl?: string;
}

@Component({
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
  imports: [DesktopWindow, NgOptimizedImage],
})
export class App {
  protected readonly projectsOpen = signal(false);
  protected readonly aboutOpen = signal(false);

  protected readonly currentTime = signal(this.formatTime());

  private readonly destroyRef = inject(DestroyRef);

  private highestLayer = 2;

  protected readonly projectsLayer = signal(1);
  protected readonly aboutLayer = signal(2);

  protected readonly projects: Project[] = [
    {
      id: 1,
      title: 'Portfolio Desktop',
      description: 'Mon portfolio sous forme de bureau interactif.',
      technologies: ['Angular', 'SCSS', 'GSAP'],
      category: 'frontend',
      image: '/projects/portfolio.png',
      repositoryUrl: 'https://github.com/maxime-perron-dev/portfolio',
    },
    {
      id: 2,
      title: 'Gestionnaire de tâches',
      description: 'Une application pour organiser les tâches du quotidien.',
      technologies: ['Angular', 'TypeScript'],
      category: 'frontend',
    },
  ];

  protected readonly filters: {
    value: ProjectFilter;
    label: string;
  }[] = [
      { value: 'all', label: 'Tous' },
      { value: 'frontend', label: 'Frontend' },
      { value: 'backend', label: 'Backend' },
    ];

  protected readonly activeFilter = signal<ProjectFilter>('all');

  protected readonly filteredProjects = computed(() => {
    const filter = this.activeFilter();

    if (filter === 'all') {
      return this.projects;
    }

    return this.projects.filter(
      project => project.category === filter,
    );
  });

  constructor() {
    const clockInterval = window.setInterval(() => {
      this.currentTime.set(this.formatTime());
    }, 1000);

    this.destroyRef.onDestroy(() => {
      window.clearInterval(clockInterval);
    });
  }

  private formatTime(): string {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
  }

  protected bringToFront(window: 'projects' | 'about'): void {
    const layer = window === 'projects'
      ? this.projectsLayer
      : this.aboutLayer;

    if (layer() === this.highestLayer) {
      return;
    }

    this.highestLayer += 1;
    layer.set(this.highestLayer);
  }
}
