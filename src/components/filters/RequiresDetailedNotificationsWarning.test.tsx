import { renderWithAppContext } from '../../__helpers__/test-utils';

import { RequiresDetailedNotificationWarning } from './RequiresDetailedNotificationsWarning';

describe('renderer/components/filters/RequiresDetailedNotificationsWarning.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<RequiresDetailedNotificationWarning />);

    expect(tree).toMatchSnapshot();
  });
});
