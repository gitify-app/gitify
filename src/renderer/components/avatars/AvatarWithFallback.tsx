import type React from 'react';
import { useState } from 'react';

import { FeedPersonIcon, MarkGithubIcon, OrganizationIcon } from '@primer/octicons-react';
import { Avatar, Stack, Truncate } from '@primer/react';

import { type Link, Size, type UserType } from '../../types';

import { isNonHumanUser } from '../../utils/notifications/filters/userType';

export interface AvatarWithFallbackProps {
  src?: Link;
  alt?: string;
  name?: string;
  size?: number;
  userType?: UserType;
}

interface DefaultUserIconProps {
  userType: UserType;
  size?: number;
}

// Renders one of a fixed set of statically-imported icons via literal JSX
// per branch (mirroring utils/ui/icons.ts#getDefaultUserIcon, which stays a
// plain lookup used elsewhere/tested directly). Selecting a component via a
// function call and rendering it as a dynamic JSX tag (`<Icon />`) is flagged
// by the React Compiler as "creating a component during render" regardless of
// where that selection happens, so each case must be a literal JSX element.
const DefaultUserIcon: React.FC<DefaultUserIconProps> = ({ userType, size }) => {
  switch (userType) {
    case 'Bot':
    case 'Mannequin':
      return <MarkGithubIcon size={size} />;
    case 'Organization':
      return <OrganizationIcon size={size} />;
    default:
      return <FeedPersonIcon size={size} />;
  }
};

export const AvatarWithFallback: React.FC<AvatarWithFallbackProps> = ({
  src,
  alt,
  name,
  size = Size.MEDIUM,
  userType = 'User',
}) => {
  const [hasBrokenAvatarSource, setHasBrokenAvatarSource] = useState(false);

  const isNonHuman = isNonHumanUser(userType);

  // TODO explore using AnchoredOverlay component (https://primer.style/components/anchored-overlay/react/alpha) to render Avatar Card on hover
  return (
    <Stack align="center" data-testid="avatar" direction="horizontal" gap="condensed">
      {!src || hasBrokenAvatarSource ? (
        <DefaultUserIcon size={size} userType={userType} />
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
