import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { mockAccountNotifications } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import { ReasonFilter } from './ReasonFilter';

describe('renderer/components/filters/ReasonFilter.tsx', () => {
  it('should render itself & its children', () => {
    const tree = render(
      <AppContext.Provider
        value={{
          settings: mockSettings,
          notifications: mockAccountNotifications,
        }}
      >
        <MemoryRouter>
          <ReasonFilter />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });
});
