import type { FC, ReactNode } from 'react';

import { Sidebar } from '../Sidebar';

interface IAppLayout {
  children: ReactNode;
}

/**
 * AppLayout is the main container for the application.
 * It handles the basic layout with sidebar and content area.
 */
export const AppLayout: FC<IAppLayout> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gitify-background">
      {/* Content first in DOM so initial focus won't land on sidebar buttons */}
      <div className="flex-1 pl-sidebar">{children}</div>

      <Sidebar />
    </div>
  );
};
