import type { FC, ReactNode } from 'react';

import { Box } from '@primer/react';

interface IPage {
  children: ReactNode;
  testId?: string;
}

/**
 * Page component represents a single page view.
 * It creates a column layout for header, content, and footer.
 * The height is 100% to fill the parent container.
 */
export const Page: FC<IPage> = ({ children, testId }) => {
  return (
    <Box className="flex flex-col h-screen" data-testid={testId}>
      {children}
    </Box>
  );
};
