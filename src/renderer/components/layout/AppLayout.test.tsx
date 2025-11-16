import { MemoryRouter } from 'react-router-dom';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockAuth, mockSettings } from '../../__mocks__/state-mocks';
import { AppLayout } from './AppLayout';

describe('renderer/components/layout/AppLayout.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(
      <MemoryRouter>
        <AppLayout>Test</AppLayout>
      </MemoryRouter>,
      {
        auth: mockAuth,
        settings: mockSettings,
        notifications: [],
      },
    );

    expect(tree).toMatchSnapshot();
  });
});
