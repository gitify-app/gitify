import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { mockAuth, mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import { SettingsReset } from './SettingsReset';

describe('renderer/components/settings/SettingsReset.tsx', () => {
  const resetSettings = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reset default settings when `OK`', async () => {
    window.confirm = jest.fn(() => true); // always click 'OK'

    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            resetSettings,
          }}
        >
          <MemoryRouter>
            <SettingsReset />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('settings-reset'));
    await userEvent.click(screen.getByText('Reset'));

    expect(resetSettings).toHaveBeenCalled();
  });

  it('should skip reset default settings when `cancelled`', async () => {
    window.confirm = jest.fn(() => false); // always click 'cancel'

    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            resetSettings,
          }}
        >
          <MemoryRouter>
            <SettingsReset />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('settings-reset'));
    await userEvent.click(screen.getByText('Cancel'));

    expect(resetSettings).not.toHaveBeenCalled();
  });
});
