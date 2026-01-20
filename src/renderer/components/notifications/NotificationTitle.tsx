import type { FC } from 'react';

import { Text } from '@primer/react';

import { parseInlineCode } from '../../utils/helpers';

interface NotificationTitleProps {
  title: string;
  className?: string;
}

export const NotificationTitle: FC<NotificationTitleProps> = ({
  title,
  className,
}: NotificationTitleProps) => {
  const parts = parseInlineCode(title);

  return (
    <Text className={className}>
      {parts.map((part, index) =>
        part.type === 'code' ? (
          <code
            className="px-1 py-0.5 rounded bg-gitify-notification-hover font-mono text-xs"
            // biome-ignore lint/suspicious/noArrayIndexKey: parts are derived from static title
            key={index}
          >
            {part.content}
          </code>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: parts are derived from static title
          <span key={index}>{part.content}</span>
        ),
      )}
    </Text>
  );
};
