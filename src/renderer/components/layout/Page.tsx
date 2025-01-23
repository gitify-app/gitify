import type { FC, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface IPage {
  children: ReactNode;
  id: string;
  type: 'h-full' | 'h-screen';
}

export const Page: FC<IPage> = (props: IPage) => {
  return (
    <div className={cn('flex flex-col', props.type)} data-testid={props.id}>
      {props.children}
    </div>
  );
};
