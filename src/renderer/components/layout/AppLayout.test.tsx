import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { AppLayout } from './AppLayout';

describe('renderer/components/layout/AppLayout.tsx', () => {
  it('renders itself & its children', () => {
    const tree = renderWithProviders(<AppLayout>Test</AppLayout>);

    expect(tree.container).toMatchSnapshot();
  });

  it('keeps the sidebar outside the route transition boundary', () => {
    renderWithProviders(<AppLayout>Test</AppLayout>);

    const routeContent = screen.getByTestId('route-content');
    expect(routeContent).toHaveTextContent('Test');
    expect(routeContent).not.toContainElement(screen.getByRole('button', { name: 'Gitify' }));
  });
});
