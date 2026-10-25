import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../../__helpers__/test-utils';

import { SettingsReveal } from './SettingsReveal';

describe('renderer/components/settings/controls/SettingsReveal.tsx', () => {
  it('exposes an open state', () => {
    renderWithProviders(
      <SettingsReveal name="details" open={true}>
        <div>Details</div>
      </SettingsReveal>,
    );

    expect(screen.getByTestId('reveal-details')).toHaveAttribute('data-state', 'open');
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('hides and inerts collapsed content', () => {
    renderWithProviders(
      <SettingsReveal name="details" open={false}>
        <div>Details</div>
      </SettingsReveal>,
    );

    const reveal = screen.getByTestId('reveal-details');

    expect(reveal).toHaveAttribute('data-state', 'closed');
    expect(reveal).toHaveAttribute('aria-hidden', 'true');
    expect(reveal).toHaveAttribute('inert');
  });
});
