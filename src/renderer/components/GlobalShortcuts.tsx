import { type FC, useEffect } from 'react';

import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts';

import { getNormalizedKey, shouldIgnoreKeyboardEvent } from '../utils/keyboard';

/**
 * Component that registers global keyboard shortcuts for the renderer app.
 * Mount once inside App, within Router + AppProvider.
 */
export const GlobalShortcuts: FC = () => {
  const { shortcuts } = useGlobalShortcuts();

  useEffect(() => {
    const keyToName = new Map<string, keyof typeof shortcuts>(
      Object.entries(shortcuts).map(([name, cfg]) => [
        cfg.key,
        name as keyof typeof shortcuts,
      ]),
    );

    const handler = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or with modifiers
      if (shouldIgnoreKeyboardEvent(event)) {
        return;
      }

      const key = getNormalizedKey(event);
      const name = keyToName.get(key);
      if (!name) {
        return;
      }

      if (shortcuts[name].isAllowed) {
        event.preventDefault();
        shortcuts[name].action();
      }
    };

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [shortcuts]);

  return null;
};
