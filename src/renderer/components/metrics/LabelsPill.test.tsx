import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';

import { LabelsPill } from './LabelsPill';

describe('renderer/components/metrics/LabelsPill.tsx', () => {
  it('renders labels pill', () => {
    const mockNotification = { ...mockGitifyNotification };
    mockNotification.subject.labels = ['enhancement', 'good-first-issue'];

    const tree = renderWithAppContext(
      <LabelsPill labels={mockNotification.subject.labels} />,
    );

    expect(tree).toMatchSnapshot();
  });
});
