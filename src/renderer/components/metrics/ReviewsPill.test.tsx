import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';

import { ReviewsPill, type ReviewsPillProps } from './ReviewsPill';

describe('renderer/components/metrics/ReviewsPill.tsx', () => {
  it('renders review pills when reviews exist', () => {
    const props: ReviewsPillProps = {
      reviewers: [
        ...(mockGitifyNotification.subject.reviewers ?? []),
        { user: 'thread-only', threads: { resolved: 0, total: 2 } },
      ],
    };

    const tree = renderWithProviders(<ReviewsPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders nothing when no reviews', () => {
    const props: ReviewsPillProps = {
      reviewers: [],
    };

    const tree = renderWithProviders(<ReviewsPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders unresolved thread status and activity in deterministic order', () => {
    const tree = renderWithProviders(
      <ReviewsPill
        reviewers={[
          { user: 'zoe', state: 'COMMENTED', threads: { resolved: 1, total: 1 } },
          { user: 'alice', state: 'APPROVED', threads: { resolved: 1, total: 3 } },
        ]}
      />,
    );

    expect(tree.getByText('2/4')).toBeInTheDocument();
    expect(tree.getByText('alice: 1/3 resolved · zoe: 1/1 resolved')).toBeInTheDocument();
    expect(tree.queryByText('zoe left review comments')).not.toBeInTheDocument();
  });

  it('renders resolved thread total with singular descriptions', () => {
    const tree = renderWithProviders(
      <ReviewsPill reviewers={[{ user: 'reviewer', threads: { resolved: 1, total: 1 } }]} />,
    );

    expect(tree.getByText('1/1')).toBeInTheDocument();
    expect(tree.getByText('reviewer: 1/1 resolved')).toBeInTheDocument();
  });

  it('renders nothing for commented reviews without threads', () => {
    const tree = renderWithProviders(
      <ReviewsPill
        reviewers={[{ user: 'reviewer', state: 'COMMENTED', threads: { resolved: 0, total: 0 } }]}
      />,
    );

    expect(tree.container).toBeEmptyDOMElement();
  });
});
