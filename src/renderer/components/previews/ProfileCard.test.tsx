import { fireEvent, screen } from '@testing-library/react';

import { renderWithProviders } from '../../__helpers__/test-utils';

import type { Link } from '../../types';

import * as comms from '../../utils/system/comms';
import { ProfileCard, type ProfileCardProps, toProfileCardProps } from './ProfileCard';

describe('renderer/components/previews/ProfileCard.tsx', () => {
  const userCard: ProfileCardProps = {
    login: 'octocat',
    name: 'The Octocat',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
    type: 'User',
    bio: 'There once was...',
    company: '@github',
    location: 'San Francisco',
    followersCount: 3000,
    profileUrl: 'https://github.com/octocat' as Link,
  };

  it('renders a user profile with available detail', () => {
    const tree = renderWithProviders(<ProfileCard {...userCard} />);

    expect(screen.getByText('The Octocat')).toBeInTheDocument();
    expect(screen.getByText('@octocat')).toBeInTheDocument();
    expect(screen.getByText('There once was...')).toBeInTheDocument();
    expect(screen.getByText('@github')).toBeInTheDocument();
    expect(screen.getByText('San Francisco')).toBeInTheDocument();
    expect(screen.getByText('3000 followers')).toBeInTheDocument();
    expect(tree.container).toMatchSnapshot();
  });

  it('renders an organization profile', () => {
    const tree = renderWithProviders(
      <ProfileCard
        avatarUrl={'https://avatars.githubusercontent.com/u/1?v=4' as Link}
        description="How people build software"
        location="San Francisco"
        login="github"
        profileUrl={'https://github.com/github' as Link}
        type="Organization"
        websiteUrl={'https://github.com' as Link}
      />,
    );

    expect(screen.getByText('How people build software')).toBeInTheDocument();
    expect(screen.getByText('@github · Organization')).toBeInTheDocument();
    expect(screen.getByText('https://github.com')).toBeInTheDocument();
    expect(tree.container).toMatchSnapshot();
  });

  it('renders a fieldless actor with only identity', () => {
    const tree = renderWithProviders(
      <ProfileCard
        login="dependabot"
        profileUrl={'https://github.com/apps/dependabot' as Link}
        type="Bot"
      />,
    );

    expect(screen.getByText('@dependabot · Bot')).toBeInTheDocument();
    expect(tree.container).toMatchSnapshot();
  });

  it('opens the profile when the card is activated and stops propagation', () => {
    const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());
    const onRowClick = vi.fn();

    renderWithProviders(
      <div onClick={onRowClick}>
        <ProfileCard {...userCard} />
      </div>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open profile: octocat' }));

    expect(openExternalLinkSpy).toHaveBeenCalledWith(userCard.profileUrl);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('builds card props from a notification user', () => {
    expect(
      toProfileCardProps({
        login: 'octocat',
        avatarUrl: userCard.avatarUrl!,
        htmlUrl: 'https://github.com/octocat' as Link,
        type: 'User',
        bio: 'There once was...',
        followersCount: 3000,
      }),
    ).toMatchObject({
      login: 'octocat',
      bio: 'There once was...',
      followersCount: 3000,
      profileUrl: 'https://github.com/octocat',
    });
  });
});
