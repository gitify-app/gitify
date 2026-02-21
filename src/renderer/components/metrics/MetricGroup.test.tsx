import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';

import { useSettingsStore } from '../../stores';

import { MetricGroup, type MetricGroupProps } from './MetricGroup';

describe('renderer/components/metrics/MetricGroup.tsx', () => {
  it('should not render any pills when showPills is disabled', async () => {
    useSettingsStore.setState({ showPills: false });

    const mockNotification = mockGitifyNotification;
    const props: MetricGroupProps = {
      notification: mockNotification,
    };

    const tree = renderWithAppContext(<MetricGroup {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('should render pills when showPills is enabled', async () => {
    useSettingsStore.setState({ showPills: true });

    const mockNotification = mockGitifyNotification;
    const props: MetricGroupProps = {
      notification: mockNotification,
    };

    const tree = renderWithAppContext(<MetricGroup {...props} />);

    expect(tree.container).toMatchSnapshot();
  });
});
