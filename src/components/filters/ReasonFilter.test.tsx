import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../../__mocks__/notifications-mocks';

import { ReasonFilter } from './ReasonFilter';

describe('renderer/components/filters/ReasonFilter.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<ReasonFilter />, {
      notifications: mockMultipleAccountNotifications,
    });

    expect(tree).toMatchSnapshot();
  });
});
