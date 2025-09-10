import type { FC, ReactNode } from 'react';

import { Stack } from '@primer/react';

interface IFooter {
  children: ReactNode;
  justify: 'end' | 'space-between';
}

/**
 * Footer component displays actions at the bottom of the page.
 * It is fixed to the viewport bottom.
 */
export const Footer: FC<IFooter> = ({ children, justify }) => {
  return (
    <div className="left-sidebar bg-gitify-footer">
      <Stack direction="horizontal" justify={justify} padding="condensed">
        {children}
      </Stack>
    </div>
  );
};
