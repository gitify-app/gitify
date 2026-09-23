import type { FC, ReactNode, Ref } from 'react';

import { cn } from 'cn';

interface IContents {
  children: ReactNode;
  paddingHorizontal?: boolean;
  paddingBottom?: boolean;
  scrollFade?: boolean;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Contents component holds the main content of a page.
 * It provides proper padding and handles scrolling.
 */
export const Contents: FC<IContents> = ({
  children,
  paddingHorizontal = true,
  paddingBottom = false,
  scrollFade = false,
  ref,
}) => {
  return (
    <div
      className={cn(
        'grow overflow-x-hidden overflow-y-auto',
        paddingHorizontal && 'px-5',
        paddingBottom && 'pb-2',
        scrollFade && 'gitify-scroll-fade',
      )}
      ref={ref}
    >
      {children}
    </div>
  );
};
