import type React from 'react';
import { useState } from 'react';

import { FeedPersonIcon, MarkGithubIcon } from '@primer/octicons-react';
import { Avatar, Stack, Truncate } from '@primer/react';

import { type Link, Size } from '../../types';
import type { UserType } from '../../typesGitHub';
import { isNonHumanUser } from '../../utils/helpers';

export interface IAvatarWithFallback {
  src?: Link;
  alt?: string;
  name?: string;
  size?: number;
  userType?: UserType;
}

export const AvatarWithFallback: React.FC<IAvatarWithFallback> = ({
  src,
  alt,
  name,
  size = Size.MEDIUM,
  userType = 'User',
}) => {
  const [isBroken, setIsBroken] = useState(false);

  const isNonHuman = isNonHumanUser(userType);
  const DefaultUserIcon = isNonHuman ? MarkGithubIcon : FeedPersonIcon;

  // TODO explore using AnchoredOverlay component (https://primer.style/components/anchored-overlay/react/alpha) to render Avatar Card on hover
  return (
    <Stack
      direction="horizontal"
      align="center"
      gap="condensed"
      data-testid="avatar"
    >
      {!src || isBroken ? (
        <DefaultUserIcon size={size} />
      ) : (
        <Avatar
          src={src}
          alt={alt}
          size={size}
          square={isNonHuman}
          onError={() => setIsBroken(true)}
        />
      )}
      {name && (
        <Truncate title={name} inline maxWidth={280}>
          {name}
        </Truncate>
      )}
    </Stack>
  );
};
