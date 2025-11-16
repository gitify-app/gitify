import { MemoryRouter } from 'react-router-dom';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { AppLayout } from './AppLayout';

describe('renderer/components/layout/AppLayout.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(
      <MemoryRouter>
        <AppLayout>Test</AppLayout>
      </MemoryRouter>,
      {
        notifications: [],
      },
    );

    expect(tree).toMatchSnapshot();
  });
});
