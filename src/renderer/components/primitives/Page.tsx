import type { FC, ReactNode } from 'react';

interface IPage {
  children: ReactNode;
  id: string;
}

export const Page: FC<IPage> = (props: IPage) => {
  return (
    <div className="flex h-screen flex-col" data-testid={props.id}>
      {props.children}
    </div>
  );
};
