import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockAccountNotifications } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';
import type { SettingsState } from '../../types';
import { SubjectTypeFilter } from './SubjectTypeFilter';

describe('renderer/components/filters/SubjectTypeFilter.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<SubjectTypeFilter />, {
      
        settings: {
          ...mockSettings } as SettingsState,
        notifications: mockAccountNotifications });

    expect(tree).toMatchSnapshot();
  });
});
