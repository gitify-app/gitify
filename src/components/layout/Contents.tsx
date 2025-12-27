import type { FC, ReactNode } from 'react';

import { cn } from '../../utils/cn';

interface IContents {
  children: ReactNode;
  paddingHorizontal?: boolean;
  paddingBottom?: boolean;
}

/**
 * Contents component holds the main content of a page.
 * It provides proper padding and handles scrolling.
 */
export const Contents: FC<IContents> = ({
  children,
  paddingHorizontal = true,
  paddingBottom = false,
}) => {
  return (
    <div
      className={cn(
        'grow overflow-x-hidden overflow-y-auto',
        paddingHorizontal && 'px-5',
        paddingBottom && 'pb-2',
      )}
    >
      {children}
    </div>
  );
};
