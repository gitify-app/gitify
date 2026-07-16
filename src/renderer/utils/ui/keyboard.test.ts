import { describe, expect, it } from 'vitest';

import { getNormalizedKey, shouldIgnoreKeyboardEvent } from './keyboard';

describe('renderer/utils/keyboard.ts', () => {
  describe('shouldIgnoreKeyboardEvent', () => {
    const baseEvent = {
      target: null,
      metaKey: false,
      ctrlKey: false,
      altKey: false,
    } as KeyboardEvent;

    it('returns true for HTMLInputElement target', () => {
      const event = {
        ...baseEvent,
        target: document.createElement('input'),
      } as KeyboardEvent;

      expect(shouldIgnoreKeyboardEvent(event)).toBe(true);
    });

    it('returns true for HTMLTextAreaElement target', () => {
      const event = {
        ...baseEvent,
        target: document.createElement('textarea'),
      } as KeyboardEvent;

      expect(shouldIgnoreKeyboardEvent(event)).toBe(true);
    });

    it('returns true for metaKey', () => {
      const event = { ...baseEvent, metaKey: true } as KeyboardEvent;
      expect(shouldIgnoreKeyboardEvent(event)).toBe(true);
    });

    it('returns true for ctrlKey', () => {
      const event = { ...baseEvent, ctrlKey: true } as KeyboardEvent;

      expect(shouldIgnoreKeyboardEvent(event)).toBe(true);
    });

    it('returns true for altKey', () => {
      const event = { ...baseEvent, altKey: true } as KeyboardEvent;

      expect(shouldIgnoreKeyboardEvent(event)).toBe(true);
    });

    it('returns false for other elements and no modifier keys', () => {
      const event = {
        ...baseEvent,
        target: document.createElement('div'),
      } as KeyboardEvent;

      expect(shouldIgnoreKeyboardEvent(event)).toBe(false);
    });
  });
});

describe('getNormalizedKey', () => {
  it('returns lowercased key', () => {
    const event = { key: 'A' } as KeyboardEvent;

    expect(getNormalizedKey(event)).toBe('a');
  });

  it('returns lowercased key for special characters', () => {
    const event = { key: 'Enter' } as KeyboardEvent;

    expect(getNormalizedKey(event)).toBe('enter');
  });
});
