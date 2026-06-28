import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../../__mocks__/notifications-mocks';

import { ReviewRequestTypeFilter } from './ReviewRequestTypeFilter';

describe('renderer/components/filters/ReviewRequestTypeFilter.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithProviders(<ReviewRequestTypeFilter />, {
      notifications: mockMultipleAccountNotifications,
    });

    expect(tree.container).toMatchSnapshot();
  });
});
