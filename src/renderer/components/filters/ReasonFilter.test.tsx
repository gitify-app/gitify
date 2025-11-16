import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockAccountNotifications } from '../../__mocks__/account-mocks';
import { ReasonFilter } from './ReasonFilter';

describe('renderer/components/filters/ReasonFilter.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<ReasonFilter />, {
      notifications: mockAccountNotifications,
    });

    expect(tree).toMatchSnapshot();
  });
});
