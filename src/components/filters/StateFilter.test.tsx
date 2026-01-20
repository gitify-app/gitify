import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockMultipleAccountNotifications } from '../../__mocks__/notifications-mocks';

import { StateFilter } from './StateFilter';

describe('renderer/components/filters/StateFilter.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<StateFilter />, {
      notifications: mockMultipleAccountNotifications,
    });

    expect(tree).toMatchSnapshot();
  });
});
