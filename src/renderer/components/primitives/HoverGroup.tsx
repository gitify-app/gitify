import type { FC, ReactNode } from 'react';

import { Stack } from '@primer/react';

interface IHoverGroup {
  children: ReactNode;
}

export const HoverGroup: FC<IHoverGroup> = ({ children }: IHoverGroup) => {
  return (
    <div className="flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-80">
      <Stack direction="horizontal" align="center" gap="none">
        {children}
      </Stack>
    </div>
  );
};
