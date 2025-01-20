import type { FC, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface IFooter {
  children: ReactNode;
  justify: 'justify-end' | 'justify-between';
}

export const Footer: FC<IFooter> = (props: IFooter) => {
  return (
    <div
      className={cn(
        'flex items-center px-3 py-1 text-sm bg-gitify-footer',
        props.justify,
      )}
    >
      {props.children}
    </div>
  );
};
