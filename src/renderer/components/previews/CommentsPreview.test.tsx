import { fireEvent, screen } from '@testing-library/react';

import { renderWithProviders } from '../../__helpers__/test-utils';

import type { GitifyComment, Link } from '../../types';

import * as comms from '../../utils/system/comms';
import { CommentsPreview } from './CommentsPreview';

const comment = (n: number): GitifyComment => ({
  author: {
    login: `user-${n}`,
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
    htmlUrl: `https://github.com/user-${n}` as Link,
    type: 'User',
  },
  bodyHtml: `<p>Comment ${n}</p>`,
  url: `https://github.com/gitify-app/notifications-test/issues/1#issuecomment-${n}` as Link,
  createdAt: `2024-01-0${n}T00:00:00Z`,
});

describe('renderer/components/previews/CommentsPreview.tsx', () => {
  vi.spyOn(globalThis.Date, 'now').mockImplementation(() =>
    new Date('2024-06-01T12:00:00Z').valueOf(),
  );

  it('renders nothing when there are no comments', () => {
    const { container } = renderWithProviders(<CommentsPreview comments={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders a single comment', () => {
    const tree = renderWithProviders(<CommentsPreview comments={[comment(1)]} />);

    expect(screen.getByText('user-1')).toBeInTheDocument();
    expect(screen.getByText('Comment 1')).toBeInTheDocument();
    expect(tree.container).toMatchSnapshot();
  });

  it('lists multiple comments newest first', () => {
    renderWithProviders(<CommentsPreview comments={[comment(1), comment(2), comment(3)]} />);

    const bodies = screen.getAllByTestId('comment-body').map((node) => node.textContent);
    expect(bodies).toEqual(['Comment 3', 'Comment 2', 'Comment 1']);
  });

  it('opens a comment via its timestamp link and stops propagation', () => {
    const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());
    const onRowClick = vi.fn();

    renderWithProviders(
      <div onClick={onRowClick}>
        <CommentsPreview comments={[comment(1)]} />
      </div>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Open comment by user-1' }));

    expect(openExternalLinkSpy).toHaveBeenCalledWith(comment(1).url);
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
