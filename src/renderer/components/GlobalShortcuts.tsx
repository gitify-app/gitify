import { type FC, useEffect } from 'react';

import { useShortcutActions } from '../hooks/useShortcutActions';

/**
 * Component that registers global keyboard shortcuts for the renderer app.
 * Mount once inside App, within Router + AppProvider.
 */
export const GlobalShortcuts: FC = () => {
  const { shortcuts } = useShortcutActions();

  useEffect(() => {
    const keyToName = new Map<string, keyof typeof shortcuts>(
      Object.entries(shortcuts).map(([name, cfg]) => [
        cfg.key,
        name as keyof typeof shortcuts,
      ]),
    );

    const handler = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or with modifiers
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const name = keyToName.get(key);
      if (!name) {
        return;
      }

      if (shortcuts[name].enabled) {
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
