import type { Icon } from '@primer/octicons-react';
import type { FC } from 'react';
import { Size } from '../../types';
import { cn } from '../../utils/cn';

export interface IAvatarIcon {
  title: string;
  url: string | null;
  size: Size;
  defaultIcon: Icon;
}

export const AvatarIcon: FC<IAvatarIcon> = (props: IAvatarIcon) => {
  if (props.url) {
    return (
      <img
        className={cn(
          'rounded-full object-cover',
          props.size === Size.XSMALL
            ? 'size-4'
            : props.size === Size.SMALL
              ? 'size-5'
              : 'size-6',
        )}
        src={props.url}
        alt={`${props.title}'s avatar`}
      />
    );
  }

  return (
    <props.defaultIcon
      size={props.size}
      className="text-gray-500 dark:text-gray-300"
    />
  );
};
