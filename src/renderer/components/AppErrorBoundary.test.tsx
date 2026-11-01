import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';

import * as logger from '../utils/core/logger';
import { AppErrorBoundary } from './AppErrorBoundary';

function Boom(): ReactElement {
  throw new Error('boom');
}

describe('renderer/components/AppErrorBoundary.tsx', () => {
  it('renders the fallback and logs the error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logSpy = vi.spyOn(logger, 'rendererLogError').mockImplementation(() => {});

    render(
      <AppErrorBoundary>
        <Boom />
      </AppErrorBoundary>,
    );

    expect(await screen.findByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reload/ })).toBeInTheDocument();
    expect(logSpy).toHaveBeenCalled();

    logSpy.mockRestore();
    consoleError.mockRestore();
  });
});
