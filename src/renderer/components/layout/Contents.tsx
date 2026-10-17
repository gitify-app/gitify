import type { ReactNode } from 'react';

import { cn } from 'cn';

interface IContents {
  children: ReactNode;
  paddingHorizontal?: boolean;
  paddingBottom?: boolean;
  scrollFade?: boolean;
}

/**
 * Contents component holds the main content of a page.
 * It provides proper padding and handles scrolling.
 */
export function Contents({
  children,
  paddingHorizontal = true,
  paddingBottom = false,
  scrollFade = false,
}: Readonly<IContents>) {
  return (
    <div
      className={cn(
        'grow overflow-x-hidden overflow-y-auto',
        paddingHorizontal && 'px-5',
        paddingBottom && 'pb-2',
        scrollFade && 'gitify-scroll-fade',
      )}
    >
      {children}
    </div>
  );
}
