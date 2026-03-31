export const MODIFIER_SEGMENTS = [
  {
    accelerator: 'CommandOrControl',
    test: (e: KeyboardEvent) => e.metaKey || e.ctrlKey,
    mac: '⌘',
    other: 'Ctrl',
  },
  {
    accelerator: 'Shift',
    test: (e: KeyboardEvent) => e.shiftKey,
    mac: '⇧',
    other: '⇧',
  },
  {
    accelerator: 'Alt',
    test: (e: KeyboardEvent) => e.altKey,
    mac: 'Option (⌥)',
    other: 'Alt',
  },
] as const;

const CODE_TO_ACCELERATOR: Record<string, string> = {
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

const MODIFIER_KEYS = new Set(['Control', 'Shift', 'Alt', 'Meta', 'Dead']);

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

  return [
    ...MODIFIER_SEGMENTS.filter((m) => m.test(event)).map((m) => m.accelerator),
    keyPart,
  ].join('+');
}

function normalizePhysicalKeyToAccelerator(
  event: KeyboardEvent,
): string | null {
  const { code, key } = event;

  if (MODIFIER_KEYS.has(key)) {
    return null;
  }

  if (code.startsWith('Key')) {
    return code.slice(3);
  }
  if (code.startsWith('Digit')) {
    return code.slice(5);
  }
  if (/^F([1-9]|1[0-9]|2[0-4])$/.test(code)) {
    return code;
  }

  return CODE_TO_ACCELERATOR[code] ?? null;
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
      const entry = MODIFIER_SEGMENTS.find((m) => m.accelerator === segment);
      return entry ? (isMac ? entry.mac : entry.other) : segment;
    })
    .join(isMac ? '·' : '+');
}
