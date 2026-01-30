import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';

import { MetricGroup, type MetricGroupProps } from './MetricGroup';

describe('renderer/components/metrics/MetricGroup.tsx', () => {
  it('should not render any pills when showPills is disabled', async () => {
    const mockNotification = mockGitifyNotification;
    const props: MetricGroupProps = {
      notification: mockNotification,
    };

    const tree = renderWithAppContext(<MetricGroup {...props} />, {
      settings: { ...mockSettings, showPills: false },
    });

    expect(tree).toMatchSnapshot();
  });

  it('should render pills when showPills is enabled', async () => {
    const mockNotification = mockGitifyNotification;
    const props: MetricGroupProps = {
      notification: mockNotification,
    };

    const tree = renderWithAppContext(<MetricGroup {...props} />, {
      settings: { ...mockSettings, showPills: true },
    });

    expect(tree).toMatchSnapshot();
  });
});
