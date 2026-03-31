/**
 * Convert a keydown event to an Electron accelerator string, or `null` if invalid.
 * Requires Command (macOS) or Control (Windows/Linux) plus a non-modifier key.
 */
export function keyboardEventToAccelerator(
  event: KeyboardEvent,
): string | null {
  if (event.repeat) {
    return null;
  }

  const primary = event.metaKey || event.ctrlKey;
  if (!primary) {
    return null;
  }

  const keyPart = normalizePhysicalKeyToAccelerator(event);
  if (!keyPart) {
    return null;
  }

  const parts: string[] = ['CommandOrControl'];
  if (event.shiftKey) {
    parts.push('Shift');
  }
  if (event.altKey) {
    parts.push('Alt');
  }
  parts.push(keyPart);

  return parts.join('+');
}

function normalizePhysicalKeyToAccelerator(
  event: KeyboardEvent,
): string | null {
  const { code, key } = event;

  if (
    key === 'Control' ||
    key === 'Shift' ||
    key === 'Alt' ||
    key === 'Meta' ||
    key === 'Dead'
  ) {
    return null;
  }

  if (code.startsWith('Key')) {
    return code.slice(3).toUpperCase();
  }
  if (code.startsWith('Digit')) {
    return code.slice(5);
  }
  if (/^F([1-9]|1[0-9]|2[0-4])$/.test(code)) {
    return code;
  }

  const byCode: Record<string, string> = {
    Space: 'Space',
    Tab: 'Tab',
    Minus: '-',
    Equal: '=',
    BracketLeft: '[',
    BracketRight: ']',
    Backslash: '\\',
    Semicolon: ';',
    Quote: "'",
    Comma: ',',
    Period: '.',
    Slash: '/',
    Backquote: '`',
    IntlBackslash: '\\',
  };

  if (byCode[code]) {
    return byCode[code];
  }

  return null;
}

export interface ModifierState {
  meta: boolean;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
}

export const emptyModifierState: ModifierState = {
  meta: false,
  ctrl: false,
  shift: false,
  alt: false,
};

export function modifiersFromEvent(event: KeyboardEvent): ModifierState {
  return {
    meta: event.metaKey,
    ctrl: event.ctrlKey,
    shift: event.shiftKey,
    alt: event.altKey,
  };
}

/**
 * Human-readable representation of currently-pressed modifier keys while recording.
 * Returns an empty string if no modifiers are active.
 */
export function formatModifiersForDisplay(
  modifiers: ModifierState,
  isMac: boolean,
): string {
  const parts: string[] = [];
  if (modifiers.meta || modifiers.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (modifiers.shift) {
    parts.push('⇧');
  }
  if (modifiers.alt) {
    parts.push(isMac ? 'Option (⌥)' : 'Alt');
  }
  return parts.join(isMac ? '·' : '+');
}

/**
 * Human-readable shortcut for settings UI. Uses platform-appropriate modifier names.
 */
export function formatAcceleratorForDisplay(
  accelerator: string,
  isMac: boolean,
): string {
  return accelerator
    .split('+')
    .map((segment) => {
      switch (segment) {
        case 'CommandOrControl':
          return isMac ? '⌘' : 'Ctrl';
        case 'Shift':
          return '⇧';
        case 'Alt':
          return isMac ? 'Option (⌥)' : 'Alt';
        default:
          return segment;
      }
    })
    .join(isMac ? '·' : '+');
}
