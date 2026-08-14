import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';

import { ReviewsPill, type ReviewsPillProps } from './ReviewsPill';

describe('renderer/components/metrics/ReviewsPill.tsx', () => {
  it('renders review pills when reviews exist', () => {
    const props: ReviewsPillProps = {
      reviews: mockGitifyNotification.subject.reviews ?? [],
      reviewThreads: {
        total: 3,
        unresolved: 2,
        starters: [
          { user: 'octocat', resolved: 1, total: 1 },
          { user: 'gitify-app', resolved: 0, total: 2 },
        ],
      },
    };

    const tree = renderWithProviders(<ReviewsPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders nothing when no reviews', () => {
    const props: ReviewsPillProps = {
      reviews: [],
    };

    const tree = renderWithProviders(<ReviewsPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders unresolved thread status and activity in deterministic order', () => {
    const tree = renderWithProviders(
      <ReviewsPill
        reviewThreads={{
          total: 4,
          unresolved: 2,
          starters: [
            { user: 'zoe', resolved: 1, total: 1 },
            { user: 'alice', resolved: 1, total: 3 },
          ],
        }}
        reviews={[
          { state: 'COMMENTED', users: ['zoe'] },
          { state: 'APPROVED', users: ['alice'] },
        ]}
      />,
    );

    expect(tree.getByText('2')).toBeInTheDocument();
    expect(tree.getByText('alice: 1/3 resolved · zoe: 1/1 resolved')).toBeInTheDocument();
    expect(tree.queryByText('zoe left review comments')).not.toBeInTheDocument();
  });

  it('renders resolved thread total with singular descriptions', () => {
    const tree = renderWithProviders(
      <ReviewsPill
        reviewThreads={{
          total: 1,
          unresolved: 0,
          starters: [{ user: 'reviewer', resolved: 1, total: 1 }],
        }}
        reviews={[]}
      />,
    );

    expect(tree.getByText('1')).toBeInTheDocument();
    expect(tree.getByText('reviewer: 1/1 resolved')).toBeInTheDocument();
  });

  it('renders nothing for commented reviews without threads', () => {
    const tree = renderWithProviders(
      <ReviewsPill reviews={[{ state: 'COMMENTED', users: ['reviewer'] }]} />,
    );

    expect(tree.container).toBeEmptyDOMElement();
  });
});
