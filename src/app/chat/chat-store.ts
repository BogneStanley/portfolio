import { Service, signal } from '@angular/core';
import { answerPortfolio, ChatSource } from './portfolio-answers';

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  sources: ChatSource[];
}
export const MAX_QUESTION_LENGTH = 500;

@Service()
export class ChatStore {
  private nextId = 0;
  private readonly history = signal<ChatMessage[]>([]);
  readonly messages = this.history.asReadonly();

  ask(question: string): boolean {
    const text = question.trim();
    if (!text || text.length > MAX_QUESTION_LENGTH) return false;
    const answer = answerPortfolio(text);
    this.history.update((messages) => [
      ...messages,
      { id: this.nextId++, role: 'user', text, sources: [] },
      { id: this.nextId++, role: 'assistant', ...answer },
    ]);
    return true;
  }
  reset(): void {
    this.history.set([]);
  }
}
