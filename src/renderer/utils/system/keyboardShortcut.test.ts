import {
  formatAcceleratorForDisplay,
  keyboardEventToAccelerator,
} from './keyboardShortcut';

function makeKeyDown(
  init: Partial<KeyboardEventInit> & { code: string },
): KeyboardEvent {
  return new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    ...init,
  });
}

describe('keyboardEventToAccelerator', () => {
  it('returns CommandOrControl+Shift+G for meta+shift+KeyG on macOS-style event', () => {
    const ev = makeKeyDown({
      code: 'KeyG',
      key: 'G',
      metaKey: true,
      shiftKey: true,
    });
    expect(keyboardEventToAccelerator(ev)).toBe('CommandOrControl+Shift+G');
  });

  it('returns CommandOrControl+Shift+Alt+G when Option/Alt is held', () => {
    const ev = makeKeyDown({
      code: 'KeyG',
      key: 'G',
      metaKey: true,
      shiftKey: true,
      altKey: true,
    });
    expect(keyboardEventToAccelerator(ev)).toBe('CommandOrControl+Shift+Alt+G');
  });

  it('returns null without meta or ctrl', () => {
    const ev = makeKeyDown({
      code: 'KeyG',
      key: 'g',
      shiftKey: true,
    });
    expect(keyboardEventToAccelerator(ev)).toBeNull();
  });

  it('returns null for modifier-only keydown', () => {
    const ev = makeKeyDown({
      code: 'ShiftLeft',
      key: 'Shift',
      shiftKey: true,
      metaKey: true,
    });
    expect(keyboardEventToAccelerator(ev)).toBeNull();
  });

  it('maps ctrl+KeyG on Windows-style event', () => {
    const ev = makeKeyDown({
      code: 'KeyG',
      key: 'g',
      ctrlKey: true,
    });
    expect(keyboardEventToAccelerator(ev)).toBe('CommandOrControl+G');
  });
});

describe('formatAcceleratorForDisplay', () => {
  it('uses Option on mac for Alt segment', () => {
    expect(
      formatAcceleratorForDisplay('CommandOrControl+Shift+Alt+G', true),
    ).toBe('⌘·⇧·Option (⌥)·G');
  });

  it('uses Alt on non-mac', () => {
    expect(
      formatAcceleratorForDisplay('CommandOrControl+Shift+Alt+G', false),
    ).toBe('Ctrl+⇧+Alt+G');
  });
});
