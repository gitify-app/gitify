import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockAuth, mockSettings } from '../../__mocks__/state-mocks';
import { SettingsReset } from './SettingsReset';

describe('renderer/components/settings/SettingsReset.tsx', () => {
  const mockResetSettings = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reset default settings when `OK`', async () => {
    globalThis.confirm = jest.fn(() => true); // always click 'OK'

    await act(async () => {
      renderWithAppContext(<SettingsReset />, {
        resetSettings: mockResetSettings,
      });
    });

    await userEvent.click(screen.getByTestId('settings-reset'));
    await userEvent.click(screen.getByText('Reset'));

    expect(mockResetSettings).toHaveBeenCalled();
  });

  it('should skip reset default settings when `cancelled`', async () => {
    globalThis.confirm = jest.fn(() => false); // always click 'cancel'

    await act(async () => {
      renderWithAppContext(<SettingsReset />, {
        resetSettings: mockResetSettings,
      });
    });

    await userEvent.click(screen.getByTestId('settings-reset'));
    await userEvent.click(screen.getByText('Cancel'));

    expect(mockResetSettings).not.toHaveBeenCalled();
  });
});
