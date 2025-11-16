import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockAccountNotifications } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';
import type { SettingsState } from '../../types';
import { UserTypeFilter } from './UserTypeFilter';

describe('renderer/components/filters/UserTypeFilter.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<UserTypeFilter />, {
      
        settings: {
          ...mockSettings,
          detailedNotifications: true } as SettingsState,
        notifications: mockAccountNotifications });

    expect(tree).toMatchSnapshot();
  });
});
