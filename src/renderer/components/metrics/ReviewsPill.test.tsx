import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';

import { ReviewsPill, type ReviewsPillProps } from './ReviewsPill';

describe('renderer/components/metrics/ReviewsPill.tsx', () => {
  it('renders review pills when reviews exist', () => {
    const props: ReviewsPillProps = {
      reviews: mockGitifyNotification.subject.reviews,
    };

    const tree = renderWithAppContext(<ReviewsPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders nothing when no reviews', () => {
    const props: ReviewsPillProps = {
      reviews: [],
    };

    const tree = renderWithAppContext(<ReviewsPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });
});
