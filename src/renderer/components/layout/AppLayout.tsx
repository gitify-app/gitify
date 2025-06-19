import type { FC, ReactNode } from 'react';

import { Box } from '@primer/react';

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
    <Box className="flex flex-col min-h-screen bg-gitify-background">
      <Sidebar />
      {/* Content area with left padding to make space for the sidebar */}
      <Box className="flex-1 pl-sidebar">{children}</Box>
    </Box>
  );
};
