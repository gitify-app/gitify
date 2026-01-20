import type { FC } from 'react';

import { Text } from '@primer/react';

import { cn } from '../../utils/cn';
import { parseInlineCode } from '../../utils/helpers';

interface NotificationTitleProps {
  title: string;
  wrapTitle: boolean;
}

export const NotificationTitle: FC<NotificationTitleProps> = ({
  title,
  wrapTitle,
}: NotificationTitleProps) => {
  const parts = parseInlineCode(title);

  return (
    <Text className={!wrapTitle && 'truncate'}>
      {parts.map((part) => (
        <Text
          className={cn(
            part.type === 'code' &&
              'px-1 py-0.5 rounded bg-gitify-notification-hover font-mono text-xs',
          )}
          key={part.id}
        >
          {part.content}
        </Text>
      ))}
    </Text>
  );
};
