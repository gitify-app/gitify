import type { FC, ReactNode } from 'react';

interface IContents {
  children: ReactNode;
}

export const Contents: FC<IContents> = (props: IContents) => {
  return (
    <div className="flex-grow overflow-x-auto px-8 pb-4">{props.children}</div>
  );
};
