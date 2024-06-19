import type { Icon } from '@primer/octicons-react';
import type { FC } from 'react';
import { cn } from '../../utils/cn';

export interface IAvatar {
  title: string;
  url: string | null;
  size: 'small' | 'medium';
  defaultIcon: Icon;
}

export const AvatarIcon: FC<IAvatar> = (props: IAvatar) => {
  if (props.url) {
    return (
      <img
        className={cn(
          'cursor-pointer rounded-full object-cover',
          props.size === 'small' ? 'size-4' : 'size-5',
        )}
        src={props.url}
        alt={`${props.title}'s avatar`}
      />
    );
  }

  return (
    <props.defaultIcon
      size={props.size === 'small' ? 14 : 18}
      className="text-gray-500 dark:text-gray-300"
    />
  );
};
