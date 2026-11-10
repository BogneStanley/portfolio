import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PortfolioChat } from './portfolio-chat';
import { ChatStore, MAX_QUESTION_LENGTH } from '../../chat/chat-store';
import { WindowManager } from '../../windows/window-manager';
import { PreferencesStore } from '../../settings/preferences';

describe('Portfolio chat', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [PortfolioChat] }));
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('cycles placeholder questions and pauses on focus or reduced motion', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const manager = TestBed.inject(WindowManager);
    manager.open('chat');
    const preferences = TestBed.inject(PreferencesStore);
    preferences.systemReducedMotion.set(false);
    preferences.update({ reducedMotion: false });
    const fixture = TestBed.createComponent(PortfolioChat);
    fixture.detectChanges();
    TestBed.tick();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toBe('Qui est Stanley ?');
    vi.advanceTimersByTime(4200);
    fixture.detectChanges();
    expect(input.placeholder).not.toBe('Qui est Stanley ?');
    input.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    vi.advanceTimersByTime(6000);
    fixture.detectChanges();
    expect(input.placeholder).toBe('Posez votre question…');
    input.dispatchEvent(new FocusEvent('blur'));
    preferences.update({ reducedMotion: true });
    fixture.detectChanges();
    vi.advanceTimersByTime(6000);
    fixture.detectChanges();
    expect(input.placeholder).toBe('Qui est Stanley ?');
    fixture.destroy();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('sends a suggestion, opens its source on mobile and preserves the conversation', async () => {
    const fixture = TestBed.createComponent(PortfolioChat);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const manager = TestBed.inject(WindowManager);
    manager.setWorkspace({ x: 0, y: 0, width: 390, height: 844 }, false, true);
    manager.open('chat');
    root.querySelectorAll<HTMLButtonElement>('.suggestions button')[1].click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(root.querySelectorAll('.message')).toHaveLength(2);
    expect(root.textContent).toContain('Portfolio Desktop');
    root.querySelector<HTMLButtonElement>('.message__sources button')!.click();
    expect(manager.windows().projects.status).toBe('open');
    expect(manager.windows().chat.status).toBe('minimized');
    fixture.destroy();
    const reopened = TestBed.createComponent(PortfolioChat);
    reopened.detectChanges();
    expect(reopened.nativeElement.querySelectorAll('.message')).toHaveLength(2);
    reopened.nativeElement.querySelector('.reset-chat').click();
    reopened.detectChanges();
    expect(reopened.nativeElement.querySelectorAll('.message')).toHaveLength(0);
  });
  it('submits typed questions, clears the input and rejects empty or oversized input', async () => {
    const fixture = TestBed.createComponent(PortfolioChat);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('input')!;
    input.value = 'Quels sont ses projets ?';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    root
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(input.value).toBe('');
    expect(root.querySelectorAll('.message')).toHaveLength(2);
    const store = TestBed.inject(ChatStore);
    expect(store.ask('   ')).toBe(false);
    expect(store.ask('x'.repeat(MAX_QUESTION_LENGTH + 1))).toBe(false);
    expect(store.messages()).toHaveLength(2);
  });
});
