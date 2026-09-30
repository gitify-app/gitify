import { type FC, type MouseEvent } from 'react';

import { GitPullRequestIcon, IssueOpenedIcon } from '@primer/octicons-react';
import { Button, Stack } from '@primer/react';

import { cn } from 'cn';

import { HoverButton } from '../primitives/HoverButton';
import { HoverGroup } from '../primitives/HoverGroup';

import { type Account, type GitifyError, Size } from '../../types';

import { getAdapter } from '../../utils/forges/registry';
import { openAccountProfile, openHostIssues, openHostPulls } from '../../utils/system/links';
import { getChevronDetails } from '../../utils/ui/display';
import { AvatarWithFallback } from '../avatars/AvatarWithFallback';

export interface AccountHeaderProps {
  account: Account;
  error: GitifyError | null;
  notificationCount: number;
  isCollapsed: boolean;
  onToggle: () => void;
}

export const AccountHeader: FC<AccountHeaderProps> = ({
  account,
  error,
  notificationCount,
  isCollapsed,
  onToggle,
}) => {
  const Chevron = getChevronDetails(notificationCount > 0, !isCollapsed, 'account');

  return (
    <Stack
      className={cn(
        'group relative pr-1 py-0.5',
        error ? 'bg-gitify-account-error' : 'bg-gitify-account-rest',
      )}
      direction="horizontal"
      onClick={onToggle}
    >
      <Button
        alignContent="center"
        count={notificationCount}
        data-testid="account-profile"
        onClick={(event: MouseEvent<HTMLElement>) => {
          // Don't trigger onClick of parent element.
          event.stopPropagation();
          openAccountProfile(account);
        }}
        title="Open account profile"
        variant="invisible"
      >
        <AvatarWithFallback
          alt={getAdapter(account).formatUserLogin(account.user!.login)}
          name={getAdapter(account).formatUserLogin(account.user!.login)}
          size={Size.MEDIUM}
          src={account.user!.avatar ?? undefined}
        />
      </Button>

      <HoverGroup
        bgColor={
          error ? 'group-hover:bg-gitify-account-error' : 'group-hover:bg-gitify-account-rest'
        }
      >
        <HoverButton
          action={() => openHostIssues(account)}
          icon={IssueOpenedIcon}
          label="My issues ↗"
          testid="account-issues"
        />

        <HoverButton
          action={() => openHostPulls(account)}
          icon={GitPullRequestIcon}
          label="My pull requests ↗"
          testid="account-pull-requests"
        />

        <HoverButton
          action={onToggle}
          icon={Chevron.icon}
          label={Chevron.label}
          testid="account-toggle"
        />
      </HoverGroup>
    </Stack>
  );
};
