import { Box, Stack } from '@primer/react';
import type { FC, ReactNode } from 'react';

interface IFooter {
  children: ReactNode;
  justify: 'end' | 'space-between';
}

export const Footer: FC<IFooter> = (props: IFooter) => {
  return (
    <Box className="fixed bottom-0 left-sidebar right-0 bg-gitify-footer">
      <Stack direction="horizontal" justify={props.justify} padding="condensed">
        {props.children}
      </Stack>
    </Box>
  );
};
