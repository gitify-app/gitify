import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { mockAuth, mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import { AppLayout } from './AppLayout';

describe('renderer/components/layout/AppLayout.tsx', () => {
  it('should render itself & its children', () => {
    const tree = render(
      <AppContext.Provider
        value={{
          auth: mockAuth,
          settings: mockSettings,
          notifications: [],
        }}
      >
        <MemoryRouter>
          <AppLayout>Test</AppLayout>
        </MemoryRouter>
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });
});
