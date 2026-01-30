import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';

import { CommentsPill } from './CommentsPill';

describe('renderer/components/metrics/CommentsPill.tsx', () => {
  it('renders with no comments (null)', () => {
    const mockNotification = { ...mockGitifyNotification };
    mockNotification.subject.commentCount = null;

    const tree = renderWithAppContext(
      <CommentsPill commentCount={mockNotification.subject.commentCount} />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('renders with 1 comment', () => {
    const mockNotification = { ...mockGitifyNotification };
    mockNotification.subject.commentCount = 1;

    const tree = renderWithAppContext(
      <CommentsPill commentCount={mockNotification.subject.commentCount} />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('renders with multiple comments', () => {
    const mockNotification = { ...mockGitifyNotification };
    mockNotification.subject.commentCount = 2;

    const tree = renderWithAppContext(
      <CommentsPill commentCount={mockNotification.subject.commentCount} />,
    );

    expect(tree).toMatchSnapshot();
  });
});
