import { type ReactNode, ViewTransition } from 'react';
import { useTranslation } from 'react-i18next';

import { Sidebar } from '../Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * AppLayout is the main container for the application.
 * It handles the basic layout with sidebar and content area.
 */
export function AppLayout({ children }: Readonly<AppLayoutProps>) {
  const { t } = useTranslation();
  const setFocusRef = (el: HTMLButtonElement | null) => {
    if (el) {
      el.focus();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gitify-background">
      {/* Hidden focus sentinel; grabs initial focus via callback ref */}
      <button
        aria-label={t('layout.initial_focus', 'initial focus')}
        className="sr-only"
        ref={setFocusRef}
        type="button"
      />

      <Sidebar />

      <ViewTransition name="route">
        <div className="flex-1 pl-sidebar" data-testid="route-content">
          {children}
        </div>
      </ViewTransition>
    </div>
  );
}
