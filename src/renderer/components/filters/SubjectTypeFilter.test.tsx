import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../../__mocks__/notifications-mocks';

import { SubjectTypeFilter } from './SubjectTypeFilter';

describe('renderer/components/filters/SubjectTypeFilter.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithProviders(<SubjectTypeFilter />, {
      notifications: mockMultipleAccountNotifications,
    });

    expect(tree.container).toMatchSnapshot();
  });
});
