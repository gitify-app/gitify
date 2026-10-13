import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';

import type { GitifyComment, Link } from '../../types';

import { CommentsPill, type CommentsPillProps } from './CommentsPill';

describe('renderer/components/metrics/CommentsPill.tsx', () => {
  it('renders with no comments (null)', () => {
    const props = {} as CommentsPillProps;

    const tree = renderWithProviders(<CommentsPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders with 1 comment', () => {
    const props: CommentsPillProps = {
      commentCount: 1,
    };

    const tree = renderWithProviders(<CommentsPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders with multiple comments', () => {
    const props: CommentsPillProps = {
      commentCount: 2,
    };

    const tree = renderWithProviders(<CommentsPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('shows the comments preview on hover when comments are available', async () => {
    const comments: GitifyComment[] = [
      {
        author: {
          login: 'octocat',
          avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
          htmlUrl: 'https://github.com/octocat' as Link,
          type: 'User',
        },
        bodyHtml: '<p>Latest reply</p>',
        url: 'https://github.com/gitify-app/notifications-test/issues/1#issuecomment-1' as Link,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    renderWithProviders(<CommentsPill commentCount={1} comments={comments} />);

    await userEvent.hover(screen.getByRole('button'));

    expect(await screen.findByTestId('comments-preview-card')).toBeInTheDocument();
    expect(screen.getByText('Latest reply')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open comment by octocat' })).toBeInTheDocument();
  });
});
