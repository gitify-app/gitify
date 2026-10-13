import type React from 'react';
import type { FC } from 'react';
import { createElement, useState } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { Avatar, Stack, Truncate } from '@primer/react';

import { type Link, Size, type UserType } from '../../types';

import { isNonHumanUser } from '../../utils/notifications/filters/userType';
import { getDefaultUserIcon } from '../../utils/ui/icons';

export interface AvatarWithFallbackProps {
  src?: Link;
  alt?: string;
  name?: string;
  size?: number;
  userType?: UserType;
  /** Optional fallback icon overriding the user-type default. */
  icon?: FC<OcticonProps>;
}

export const AvatarWithFallback: React.FC<AvatarWithFallbackProps> = ({
  src,
  alt,
  name,
  size = Size.MEDIUM,
  userType = 'User',
  icon,
}) => {
  const [hasBrokenAvatarSource, setHasBrokenAvatarSource] = useState(false);

  const isNonHuman = isNonHumanUser(userType);
  const defaultUserIcon = icon ?? getDefaultUserIcon(userType);

  // Avatar hover cards are composed at the call sites with `PreviewCard` +
  // `ProfileCard`; this component stays a pure avatar primitive with no hover
  // behaviour of its own.
  return (
    <Stack align="center" data-testid="avatar" direction="horizontal" gap="condensed">
      {!src || hasBrokenAvatarSource ? (
        createElement(defaultUserIcon, { size })
      ) : (
        <Avatar
          alt={alt}
          onError={() => setHasBrokenAvatarSource(true)}
          size={size}
          square={isNonHuman}
          src={src}
        />
      )}
      {name && (
        <Truncate inline maxWidth={280} title={name}>
          {name}
        </Truncate>
      )}
    </Stack>
  );
};
