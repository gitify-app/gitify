import type { FC, ReactNode } from 'react';

interface IPage {
  children: ReactNode;
  id: string;
}

export const Page: FC<IPage> = (props: IPage) => {
  return (
    <div className="flex flex-col h-full" data-testid={props.id}>
      {props.children}
    </div>
  );
};
