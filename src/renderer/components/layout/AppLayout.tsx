import { Box } from '@primer/react';
import type { FC, ReactNode } from 'react';

import { Sidebar } from '../Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * AppLayout is the main container for the application.
 * It handles the basic layout with sidebar and content area.
 */
export const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  return (
    <Box className="flex flex-col max-h-screen bg-gitify-background">
      <Sidebar />
      {/* Content area with left padding to make space for the sidebar */}
      <Box className="flex-1 pl-sidebar">{children}</Box>
    </Box>
  );
};
