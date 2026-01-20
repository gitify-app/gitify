import type React from 'react';
import { useState } from 'react';

import { Avatar, Stack, Truncate } from '@primer/react';

import { type Link, Size, type UserType } from '../../types';

import { getDefaultUserIcon } from '../../utils/icons';
import { isNonHumanUser } from '../../utils/notifications/filters/userType';

export interface AvatarWithFallbackProps {
  src?: Link;
  alt?: string;
  name?: string;
  size?: number;
  userType?: UserType;
}

export const AvatarWithFallback: React.FC<AvatarWithFallbackProps> = ({
  src,
  alt,
  name,
  size = Size.MEDIUM,
  userType = 'User',
}) => {
  const [hasBrokenAvatarSource, setHasBrokenAvatarSource] = useState(false);

  const isNonHuman = isNonHumanUser(userType);
  const DefaultUserIcon = getDefaultUserIcon(userType);

  // TODO explore using AnchoredOverlay component (https://primer.style/components/anchored-overlay/react/alpha) to render Avatar Card on hover
  return (
    <Stack
      align="center"
      data-testid="avatar"
      direction="horizontal"
      gap="condensed"
    >
      {!src || hasBrokenAvatarSource ? (
        <DefaultUserIcon size={size} />
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
