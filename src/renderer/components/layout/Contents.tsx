import { Box } from '@primer/react';
import type { FC, ReactNode } from 'react';

interface IContents {
  children: ReactNode;
}

export const Contents: FC<IContents> = (props: IContents) => {
  return (
    <Box className="grow overflow-x-auto px-8 pb-2 mb-12 ">
      {props.children}
    </Box>
  );
};
