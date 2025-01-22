import { Stack } from '@primer/react';
import type { FC, ReactNode } from 'react';

interface IFooter {
  children: ReactNode;
  justify: 'end' | 'space-between';
}

export const Footer: FC<IFooter> = (props: IFooter) => {
  return (
    <Stack
      direction={'horizontal'}
      justify={props.justify}
      padding={'condensed'}
      className="bg-gitify-footer"
    >
      {props.children}
    </Stack>
  );
};
