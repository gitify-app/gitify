import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockAccountNotifications } from '../../__mocks__/account-mocks';
import { StateFilter } from './StateFilter';

describe('renderer/components/filters/StateFilter.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<StateFilter />, {
      notifications: mockAccountNotifications,
    });

    expect(tree).toMatchSnapshot();
  });
});
