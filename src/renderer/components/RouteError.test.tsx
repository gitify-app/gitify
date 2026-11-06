import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { RouteError } from './RouteError';

function Boom(): ReactElement {
  throw new Error('boom');
}

describe('renderer/components/RouteError.tsx', () => {
  it('renders the Oops fallback with a reload action', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const router = createMemoryRouter(
      [{ path: '/', element: <Boom />, errorElement: <RouteError /> }],
      { initialEntries: ['/'] },
    );

    render(<RouterProvider router={router} />);

    expect(await screen.findByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reload/ })).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
