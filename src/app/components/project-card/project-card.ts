import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Project, ProjectCategory } from '../../data/portfolio';
import { AppIcon } from '../app-icon/app-icon';
@Component({
  selector: 'app-project-card',
  imports: [NgOptimizedImage, AppIcon],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  readonly project = input.required<Project>();
  protected readonly categories: Record<ProjectCategory, string> = {
    web: 'Application web',
    backend: 'API & backend',
    mobile: 'Application mobile',
    package: 'Package Flutter',
    media: 'Podcast',
    learning: 'Formation',
  };
}
