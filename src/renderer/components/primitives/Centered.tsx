import type { FC, ReactNode } from 'react';

interface ICentered {
  children: ReactNode;
}

export const Centered: FC<ICentered> = (props: ICentered) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 min-h-screen">
      {props.children}
    </div>
  );
};
