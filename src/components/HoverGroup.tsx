import type { FC, ReactNode } from 'react';

interface IHoverGroup {
  children: ReactNode;
}

export const HoverGroup: FC<IHoverGroup> = ({ children }: IHoverGroup) => {
  return (
    <div className="flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-80">
      {children}
    </div>
  );
};
