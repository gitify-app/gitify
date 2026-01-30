import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';

import { ReviewsPill } from './ReviewsPill';

describe('renderer/components/metrics/ReviewsPill.tsx', () => {
  it('renders review pills when reviews exist', () => {
    const mockNotification = { ...mockGitifyNotification };
    const reviews = mockNotification.subject.reviews;

    const tree = renderWithAppContext(<ReviewsPill reviews={reviews} />);

    expect(tree).toMatchSnapshot();
  });

  it('renders nothing when no reviews', () => {
    const tree = renderWithAppContext(<ReviewsPill reviews={[]} />);

    expect(tree).toMatchSnapshot();
  });
});
