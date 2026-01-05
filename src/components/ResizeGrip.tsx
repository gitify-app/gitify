import type { FC } from 'react';

import { getCurrentWindow } from '@tauri-apps/api/window';

import { isTauriEnvironment } from '../utils/environment';

/**
 * A resize grip component for the bottom-right corner of the window.
 * Only functional in Tauri environment with decorations disabled.
 */
export const ResizeGrip: FC = () => {
  const handleMouseDown = async (e: React.MouseEvent) => {
    if (!isTauriEnvironment()) {
      return;
    }

    e.preventDefault();
    try {
      await getCurrentWindow().startResizeDragging('SouthEast');
    } catch {
      // Ignore errors - resize may not be supported on all platforms
    }
  };

  if (!isTauriEnvironment()) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 right-0 w-4 h-4 cursor-se-resize z-50 opacity-30 hover:opacity-60 transition-opacity"
      data-testid="resize-grip"
      onMouseDown={handleMouseDown}
    >
      <svg
        className="w-full h-full text-gray-400"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M14 14v-2h2v2h-2zm0-4v-2h2v2h-2zm-4 4v-2h2v2h-2zm0-4v-2h2v2h-2zm-4 4v-2h2v2h-2z" />
      </svg>
    </div>
  );
};
