import { type FC, useEffect } from 'react';

import { useShortcutActions } from '../hooks/useShortcutActions';

/**
 * Component that registers global keyboard shortcuts for the renderer app.
 * Mount once inside App, within Router + AppProvider.
 */
export const GlobalShortcuts: FC = () => {
  const { actions, enabled, hotkeys } = useShortcutActions();

  useEffect(() => {
    const keyToName = Object.entries(hotkeys).reduce<
      Record<string, keyof typeof actions>
    >((acc, [name, key]) => {
      acc[key] = name as keyof typeof actions;
      return acc;
    }, {});

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
      const name = keyToName[key];
      if (!name) {
        return;
      }

      if (enabled[name]) {
        event.preventDefault();
        actions[name]();
      }
    };

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [actions, enabled, hotkeys]);

  return null;
};
