import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mockAuth, mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import { SettingsReset } from './SettingsReset';

describe('renderer/components/settings/SettingsReset.tsx', () => {
  const resetSettings = vi.fn();

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should render reset button', () => {
    render(
      <AppContext.Provider
        value={{
          auth: mockAuth,
          settings: mockSettings,
          resetSettings,
        }}
      >
        <SettingsReset />
      </AppContext.Provider>,
    );

    expect(screen.getByTestId('settings-reset')).toBeInTheDocument();
    expect(screen.getByText('Reset Settings')).toBeInTheDocument();
  });

  it.skip('should open dialog when button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AppContext.Provider
        value={{
          auth: mockAuth,
          settings: mockSettings,
          resetSettings,
        }}
      >
        <SettingsReset />
      </AppContext.Provider>,
    );

    await user.click(screen.getByTestId('settings-reset'));

    expect(screen.getByTestId('reset-dialog')).toBeInTheDocument();
    expect(screen.getByText('Reset Settings')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Please confirm that you want to reset all settings to the',
      ),
    ).toBeInTheDocument();
  });

  it.skip('should reset settings when reset button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AppContext.Provider
        value={{
          auth: mockAuth,
          settings: mockSettings,
          resetSettings,
        }}
      >
        <SettingsReset />
      </AppContext.Provider>,
    );

    await user.click(screen.getByTestId('settings-reset'));

    const resetButton = screen.getByRole('button', { name: 'Reset' });
    await user.click(resetButton);

    expect(resetSettings).toHaveBeenCalledTimes(1);
  });

  it.skip('should not reset settings when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AppContext.Provider
        value={{
          auth: mockAuth,
          settings: mockSettings,
          resetSettings,
        }}
      >
        <SettingsReset />
      </AppContext.Provider>,
    );

    await user.click(screen.getByTestId('settings-reset'));

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(resetSettings).not.toHaveBeenCalled();
  });
});
