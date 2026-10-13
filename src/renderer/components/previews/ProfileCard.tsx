import type { FC, MouseEvent } from 'react';

import { LinkIcon, LocationIcon, OrganizationIcon, PeopleIcon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { cn } from 'cn';

import { type GitifyNotificationUser, type Link, Opacity, Size, type UserType } from '../../types';

import { openExternalLink } from '../../utils/system/comms';
import { AvatarWithFallback } from '../avatars/AvatarWithFallback';

/** Avatar size for the card, larger than list avatars to match GitHub's hovercard. */
const PROFILE_CARD_AVATAR_SIZE = 40;

export interface ProfileCardProps {
  /** Login handle shown as the primary identity. */
  login: string;
  /** Optional display name. */
  name?: string | null;
  /** Avatar URL. */
  avatarUrl?: Link;
  /** Actor type, used for the badge and the avatar fallback. */
  type: UserType;
  /** User biography. */
  bio?: string | null;
  /** User company. */
  company?: string | null;
  /** User or organization location. */
  location?: string | null;
  /** User follower count. */
  followersCount?: number;
  /** Organization description. */
  description?: string | null;
  /** Organization website. */
  websiteUrl?: Link | null;
  /** URL opened when the card is activated. */
  profileUrl: Link;
}

/**
 * Build profile card data from a notification user.
 */
export function toProfileCardProps(
  user: GitifyNotificationUser,
  profileUrl: Link = user.htmlUrl,
): ProfileCardProps {
  return {
    login: user.login,
    name: user.name,
    avatarUrl: user.avatarUrl,
    type: user.type,
    bio: user.bio,
    company: user.company,
    location: user.location,
    followersCount: user.followersCount,
    description: user.description,
    websiteUrl: user.websiteUrl,
    profileUrl,
  };
}

/**
 * An avatar card for a notification actor, repository owner, or account,
 * modelled on GitHub's profile hovercard: a large avatar, the display name over
 * the login, the biography or description, and detail rows. The whole card is
 * the click target that opens the profile - there is no separate button.
 */
export const ProfileCard: FC<ProfileCardProps> = ({
  login,
  name,
  avatarUrl,
  type,
  bio,
  company,
  location,
  followersCount,
  description,
  websiteUrl,
  profileUrl,
}) => {
  const summary = bio ?? description;

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    // The card is portaled, so React events still bubble through the row.
    event.stopPropagation();
    openExternalLink(profileUrl);
  };

  return (
    <button
      aria-label={`Open profile: ${login}`}
      className="flex w-full flex-col gap-2 text-left"
      data-testid="profile-card"
      onClick={handleOpen}
      type="button"
    >
      <Stack align="center" direction="horizontal" gap="condensed">
        <AvatarWithFallback
          alt={login}
          size={PROFILE_CARD_AVATAR_SIZE}
          src={avatarUrl}
          userType={type}
        />
        <Stack direction="vertical" gap="none">
          <Text className="text-sm font-semibold">{name ?? login}</Text>
          <Text className={cn('text-xs', Opacity.MEDIUM)}>
            @{login}
            {type !== 'User' ? ` · ${type}` : ''}
          </Text>
        </Stack>
      </Stack>

      {summary ? (
        <Text className={cn('text-xs whitespace-pre-wrap break-words', Opacity.HIGH)}>
          {summary}
        </Text>
      ) : null}

      <Stack className={cn('text-xxs', Opacity.MEDIUM)} direction="vertical" gap="none">
        {company ? (
          <Text className="flex items-center gap-1">
            <OrganizationIcon size={Size.XSMALL} />
            {company}
          </Text>
        ) : null}

        {location ? (
          <Text className="flex items-center gap-1">
            <LocationIcon size={Size.XSMALL} />
            {location}
          </Text>
        ) : null}

        {websiteUrl ? (
          <Text className="flex items-center gap-1">
            <LinkIcon size={Size.XSMALL} />
            {websiteUrl}
          </Text>
        ) : null}

        {followersCount ? (
          <Text className="flex items-center gap-1">
            <PeopleIcon size={Size.XSMALL} />
            {`${followersCount} followers`}
          </Text>
        ) : null}
      </Stack>
    </button>
  );
};
