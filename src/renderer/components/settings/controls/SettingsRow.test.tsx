import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../../__helpers__/test-utils';

import { SettingsRow } from './SettingsRow';

describe('renderer/components/settings/controls/SettingsRow.tsx', () => {
  it('renders a label, caption, and control', () => {
    renderWithProviders(
      <SettingsRow
        caption="Check for new notifications at this interval."
        label="Fetch interval"
        name="fetchInterval"
      >
        <button type="button">Control</button>
      </SettingsRow>,
    );

    expect(screen.getByText('Fetch interval')).toBeInTheDocument();
    expect(screen.getByText('Check for new notifications at this interval.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Control' })).toBeInTheDocument();
  });

  it('renders a visible disabled reason', () => {
    renderWithProviders(
      <SettingsRow
        disabled={true}
        disabledReason="Requires GitHub Enterprise Server 3.13 or later."
        label="Mark as done"
        name="markAsDone"
      >
        <button type="button">Control</button>
      </SettingsRow>,
    );

    expect(
      screen.getByText('Requires GitHub Enterprise Server 3.13 or later.'),
    ).toBeInTheDocument();
  });

  it('renders nothing when hidden', () => {
    renderWithProviders(
      <SettingsRow label="Fetch interval" name="fetchInterval" visible={false}>
        <button type="button">Control</button>
      </SettingsRow>,
    );

    expect(screen.queryByText('Fetch interval')).not.toBeInTheDocument();
  });
});
