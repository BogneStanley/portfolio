import {
  afterRenderEffect,
  afterNextRender,
  effect,
  Component,
  ElementRef,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { form, FormField, maxLength } from '@angular/forms/signals';
import { SocialLinks } from '../social-links/social-links';
import { AppIcon } from '../app-icon/app-icon';
import { ChatStore, MAX_QUESTION_LENGTH } from '../../chat/chat-store';
import { ChatSource } from '../../chat/portfolio-answers';
import { PROFILE } from '../../data/portfolio';
import { PreferencesStore } from '../../settings/preferences';
import { WindowManager } from '../../windows/window-manager';

@Component({
  selector: 'app-portfolio-chat',
  imports: [AppIcon, FormField, SocialLinks],
  templateUrl: './portfolio-chat.html',
  styleUrl: './portfolio-chat.scss',
})
export class PortfolioChat {
  protected readonly chat = inject(ChatStore);
  protected readonly profile = PROFILE;
  protected readonly draft = signal({ question: '' });
  protected readonly questionForm = form(this.draft, (path) =>
    maxLength(path.question, MAX_QUESTION_LENGTH),
  );
  protected readonly suggestions = [
    'Qui est Stanley ?',
    'Quels sont ses projets ?',
    'Quelles sont ses compétences ?',
    'Quel est son parcours ?',
  ];
  protected readonly focused = signal(false);
  protected readonly placeholderQuestion = signal(this.suggestions[0]);
  private readonly ready = signal(false);
  private readonly preferences = inject(PreferencesStore);
  protected readonly sourceLabels: Record<ChatSource, string> = {
    about: 'À propos',
    projects: 'Projets',
    skills: 'Compétences',
    experiences: 'Expériences',
    contact: 'Contact',
  };
  private readonly manager = inject(WindowManager);
  private readonly conversation = viewChild<ElementRef<HTMLElement>>('conversation');
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('questionInput');

  constructor() {
    afterNextRender(() => this.ready.set(true));
    effect((onCleanup) => {
      const paused =
        !this.ready() ||
        this.focused() ||
        !!this.draft().question ||
        this.preferences.reducedMotion() ||
        this.manager.windows().chat.status !== 'open';
      if (paused) {
        this.placeholderQuestion.set(this.suggestions[0]);
        return;
      }
      let index = 0;
      let characters = this.suggestions[0].length;
      let deleting = true;
      this.placeholderQuestion.set(this.suggestions[0]);
      let timer: ReturnType<typeof setTimeout>;
      const tick = () => {
        const question = this.suggestions[index];
        characters += deleting ? -1 : 1;
        this.placeholderQuestion.set(question.slice(0, characters));
        let delay = deleting ? 28 : 55;
        if (characters === 0) {
          index = (index + 1) % this.suggestions.length;
          deleting = false;
          delay = 220;
        } else if (!deleting && characters === question.length) {
          deleting = true;
          delay = 2200;
        }
        timer = setTimeout(tick, delay);
      };
      timer = setTimeout(tick, 2200);
      onCleanup(() => clearTimeout(timer));
    });
    afterRenderEffect(() => {
      const hasMessages = this.chat.messages().length > 0;
      untracked(() => {
        const log = this.conversation()?.nativeElement;
        if (log) log.scrollTop = hasMessages ? log.scrollHeight : 0;
      });
    });
  }
  protected send(event: Event): void {
    event.preventDefault();
    this.ask(this.draft().question);
  }
  protected ask(question: string): void {
    if (this.chat.ask(question)) {
      this.draft.set({ question: '' });
      this.input()?.nativeElement.focus({ preventScroll: true });
    }
  }
  protected reset(): void {
    this.chat.reset();
    this.draft.set({ question: '' });
    this.input()?.nativeElement.focus({ preventScroll: true });
  }
  protected openSource(source: ChatSource): void {
    this.manager.open(source);
  }
}
