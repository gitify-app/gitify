import type { FC } from 'react';

import { Text } from '@primer/react';

import { useAppContext } from '../../hooks/useAppContext';

import { cn } from '../../utils/ui/cn';
import { parseInlineCode } from '../../utils/ui/display';

interface NotificationTitleProps {
  title: string;
}

export const NotificationTitle: FC<NotificationTitleProps> = ({
  title,
}: NotificationTitleProps) => {
  const { settings } = useAppContext();
  const parts = parseInlineCode(title);

  return (
    <Text className={!settings.wrapNotificationTitle && 'truncate'}>
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
