import { renderWithProviders } from '../../__helpers__/test-utils';

import { RequiresDetailedNotificationWarning } from './RequiresDetailedNotificationsWarning';

describe('renderer/components/filters/RequiresDetailedNotificationsWarning.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithProviders(<RequiresDetailedNotificationWarning />);

    expect(tree.container).toMatchSnapshot();
  });
});
