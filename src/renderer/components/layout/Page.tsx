import { Box } from '@primer/react';
import type { FC, ReactNode } from 'react';

interface IPage {
  children: ReactNode;
  id: string;
}

/**
 * Page component represents a single page view.
 * It creates a column layout for header, content, and footer.
 * The height is 100% to fill the parent container.
 */
export const Page: FC<IPage> = ({ children, id }) => {
  return (
    <Box className="flex flex-col h-screen" data-testid={id}>
      {children}
    </Box>
  );
};
