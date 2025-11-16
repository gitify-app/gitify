import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockAccountNotifications } from '../../__mocks__/account-mocks';
import { SubjectTypeFilter } from './SubjectTypeFilter';

describe('renderer/components/filters/SubjectTypeFilter.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<SubjectTypeFilter />, {
      notifications: mockAccountNotifications,
    });

    expect(tree).toMatchSnapshot();
  });
});
