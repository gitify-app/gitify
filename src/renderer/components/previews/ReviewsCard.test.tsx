import { fireEvent, screen } from '@testing-library/react';

import { renderWithProviders } from '../../__helpers__/test-utils';

import type { GitifyPullRequestReviewer, Link } from '../../types';

import * as comms from '../../utils/system/comms';
import { ReviewsCard } from './ReviewsCard';

const reviewer = (
  overrides: Partial<GitifyPullRequestReviewer> = {},
): GitifyPullRequestReviewer => ({
  user: 'octocat',
  login: 'octocat',
  avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
  htmlUrl: 'https://github.com/octocat' as Link,
  type: 'User',
  state: 'APPROVED',
  threads: { resolved: 1, total: 2 },
  ...overrides,
});

describe('renderer/components/previews/ReviewsCard.tsx', () => {
  it('renders nothing when there are no reviewers', () => {
    const { container } = renderWithProviders(<ReviewsCard reviewers={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders each reviewer with state and thread counts', () => {
    const tree = renderWithProviders(
      <ReviewsCard
        reviewers={[
          reviewer(),
          reviewer({
            user: 'hubot',
            login: 'hubot',
            state: 'CHANGES_REQUESTED',
            threads: { resolved: 0, total: 3 },
          }),
        ]}
      />,
    );

    expect(screen.getByText('octocat')).toBeInTheDocument();
    expect(screen.getByText('Approved · 1/2 resolved')).toBeInTheDocument();
    expect(screen.getByText('hubot')).toBeInTheDocument();
    expect(screen.getByText('Changes requested · 0/3 resolved')).toBeInTheDocument();
    expect(tree.container).toMatchSnapshot();
  });

  it('opens a reviewer profile on activation and stops propagation', () => {
    const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());
    const onRowClick = vi.fn();

    renderWithProviders(
      <div onClick={onRowClick}>
        <ReviewsCard reviewers={[reviewer()]} />
      </div>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open reviewer octocat' }));

    expect(openExternalLinkSpy).toHaveBeenCalledWith('https://github.com/octocat');
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
