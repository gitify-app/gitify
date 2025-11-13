import type { FC, ReactNode } from 'react';

import { Sidebar } from '../Sidebar';

type AppLayoutProps = { children: ReactNode };

/**
 * AppLayout is the main container for the application.
 * It handles the basic layout with sidebar and content area.
 */
export const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  const setFocusRef = (el: HTMLButtonElement | null) => {
    if (el) {
      el.focus();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gitify-background">
      {/* Hidden focus sentinel; grabs initial focus via callback ref */}
      <button
        aria-label="initial focus"
        className="sr-only"
        data-testid="initial-focus-sentinel"
        ref={setFocusRef}
        type="button"
      />

      <Sidebar />

      <div className="flex-1 pl-sidebar">{children}</div>
    </div>
  );
};
