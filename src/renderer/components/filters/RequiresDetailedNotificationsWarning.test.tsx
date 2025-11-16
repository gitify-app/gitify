import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockAccountNotifications } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';
import { RequiresDetailedNotificationWarning } from './RequiresDetailedNotificationsWarning';

describe('renderer/components/filters/RequiresDetailedNotificationsWarning.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<RequiresDetailedNotificationWarning />, {
      
        settings: mockSettings,
        notifications: mockAccountNotifications });

    expect(tree).toMatchSnapshot();
  });
});
