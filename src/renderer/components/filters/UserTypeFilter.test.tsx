import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockAccountNotifications } from '../../__mocks__/account-mocks';
import { UserTypeFilter } from './UserTypeFilter';

describe('renderer/components/filters/UserTypeFilter.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<UserTypeFilter />, {
      notifications: mockAccountNotifications,
    });

    expect(tree).toMatchSnapshot();
  });
});
