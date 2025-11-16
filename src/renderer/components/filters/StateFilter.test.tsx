import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockAccountNotifications } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';
import type { SettingsState } from '../../types';
import { StateFilter } from './StateFilter';

describe('renderer/components/filters/StateFilter.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<StateFilter />, {
      
        settings: {
          ...mockSettings,
          detailedNotifications: true } as SettingsState,
        notifications: mockAccountNotifications });

    expect(tree).toMatchSnapshot();
  });
});
