import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../../__mocks__/notifications-mocks';

import { UserTypeFilter } from './UserTypeFilter';

describe('renderer/components/filters/UserTypeFilter.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<UserTypeFilter />, {
      notifications: mockMultipleAccountNotifications,
    });

    expect(tree.container).toMatchSnapshot();
  });
});
