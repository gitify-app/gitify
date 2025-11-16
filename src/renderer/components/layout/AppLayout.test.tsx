import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockAuth, mockSettings } from '../../__mocks__/state-mocks';
import { AppLayout } from './AppLayout';

describe('renderer/components/layout/AppLayout.tsx', () => {
  it('should render itself & its children', () => {
    const tree = renderWithAppContext(<AppLayout>Test</AppLayout>, {
       auth: mockAuth, settings: mockSettings, notifications: []  });

    expect(tree).toMatchSnapshot();
  });
});
