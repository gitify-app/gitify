import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockAuth, mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import { SettingsReset } from './SettingsReset';

describe('renderer/components/settings/SettingsReset.tsx', () => {
  const resetSettings = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should reset default settings when `OK`', async () => {
    window.confirm = vi.fn(() => true); // always click 'OK'

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

    fireEvent.click(screen.getByTestId('settings-reset'));
    fireEvent.click(screen.getByText('Reset'));

    expect(resetSettings).toHaveBeenCalled();
  });

  it('should skip reset default settings when `cancelled`', async () => {
    window.confirm = vi.fn(() => false); // always click 'cancel'

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

    fireEvent.click(screen.getByTestId('settings-reset'));
    fireEvent.click(screen.getByText('Cancel'));

    expect(resetSettings).not.toHaveBeenCalled();
  });
});
