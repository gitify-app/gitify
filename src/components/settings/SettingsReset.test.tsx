import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';

import * as logger from '../../utils/logger';
import { SettingsReset } from './SettingsReset';

describe('renderer/components/settings/SettingsReset.tsx', () => {
  const resetSettingsMock = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should reset default settings when `OK`', async () => {
    const rendererLogInfoSpy = vi
      .spyOn(logger, 'rendererLogInfo')
      .mockImplementation(() => {});

    globalThis.confirm = vi.fn(() => true); // always click 'OK'

    await act(async () => {
      renderWithAppContext(<SettingsReset />, {
        resetSettings: resetSettingsMock,
      });
    });

    await userEvent.click(screen.getByTestId('settings-reset'));
    await userEvent.click(screen.getByText('Reset'));

    expect(resetSettingsMock).toHaveBeenCalled();
    expect(rendererLogInfoSpy).toHaveBeenCalled();
  });

  it('should skip reset default settings when `cancelled`', async () => {
    globalThis.confirm = vi.fn(() => false); // always click 'cancel'

    await act(async () => {
      renderWithAppContext(<SettingsReset />, {
        resetSettings: resetSettingsMock,
      });
    });

    await userEvent.click(screen.getByTestId('settings-reset'));
    await userEvent.click(screen.getByText('Cancel'));

    expect(resetSettingsMock).not.toHaveBeenCalled();
  });
});
