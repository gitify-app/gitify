import type React from 'react';
import { useState } from 'react';

import { FeedPersonIcon, MarkGithubIcon } from '@primer/octicons-react';
import { Avatar, Stack, Text } from '@primer/react';

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
  return (
    <Stack
      direction="horizontal"
      align="center"
      gap="condensed"
      data-testid="avatar"
    >
      {!src || isBroken ? (
        isNonHuman ? (
          <MarkGithubIcon size={size} />
        ) : (
          <FeedPersonIcon size={size} />
        )
      ) : (
        <Avatar
          src={src}
          alt={alt}
          size={size}
          square={isNonHuman}
          onError={() => setIsBroken(true)}
        />
      )}
      {name && <Text>{name}</Text>}
    </Stack>
  );
};
