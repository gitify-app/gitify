import { Box } from '@primer/react';
import type { FC, ReactNode } from 'react';

interface IPage {
  children: ReactNode;
  id: string;
}

export const Page: FC<IPage> = (props: IPage) => {
  return (
    <Box className="flex flex-col h-screen" data-testid={props.id}>
      {props.children}
    </Box>
  );
};
