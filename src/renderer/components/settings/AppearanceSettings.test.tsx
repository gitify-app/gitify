import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitHubAppAccount } from '../../__mocks__/account-mocks';
import { AppearanceSettings } from './AppearanceSettings';

describe('renderer/components/settings/AppearanceSettings.tsx', () => {
  const updateSettingMock = jest.fn();
  const zoomTimeout = () => new Promise((r) => setTimeout(r, 300));

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should change the theme mode dropdown', async () => {
    await act(async () => {
      renderWithAppContext(<AppearanceSettings />, {
        updateSetting: updateSettingMock,
      });
    });

    await userEvent.selectOptions(
      screen.getByTestId('settings-theme'),
      'LIGHT',
    );

    expect(updateSettingMock).toHaveBeenCalledTimes(1);
    expect(updateSettingMock).toHaveBeenCalledWith('theme', 'LIGHT');
  });

  it('should toggle increase contrast checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<AppearanceSettings />, {
        auth: {
          accounts: [mockGitHubAppAccount],
        },
        updateSetting: updateSettingMock,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-increaseContrast'));

    expect(updateSettingMock).toHaveBeenCalledTimes(1);
    expect(updateSettingMock).toHaveBeenCalledWith('increaseContrast', true);
  });

  it('should update the zoom value when using CMD + and CMD -', async () => {
    window.gitify.zoom.getLevel = jest.fn().mockReturnValue(-1);

    await act(async () => {
      renderWithAppContext(<AppearanceSettings />, {
        updateSetting: updateSettingMock,
      });
    });

    fireEvent(window, new Event('resize'));
    await zoomTimeout();

    expect(updateSettingMock).toHaveBeenCalledTimes(1);
    expect(updateSettingMock).toHaveBeenCalledWith('zoomPercentage', 50);
  });

  it('should update the zoom values when using the zoom buttons', async () => {
    window.gitify.zoom.getLevel = jest.fn().mockReturnValue(0);
    window.gitify.zoom.setLevel = jest.fn().mockImplementation((level) => {
      window.gitify.zoom.getLevel = jest.fn().mockReturnValue(level);
      fireEvent(window, new Event('resize'));
    });

    await act(async () => {
      renderWithAppContext(<AppearanceSettings />, {
        updateSetting: updateSettingMock,
      });
    });

    // Zoom Out
    await act(async () => {
      await userEvent.click(screen.getByTestId('settings-zoom-out'));
      await zoomTimeout();

      expect(updateSettingMock).toHaveBeenCalledTimes(1);
      expect(updateSettingMock).toHaveBeenNthCalledWith(
        1,
        'zoomPercentage',
        90,
      );
    });

    await act(async () => {
      await userEvent.click(screen.getByTestId('settings-zoom-out'));
      await zoomTimeout();

      expect(updateSettingMock).toHaveBeenCalledTimes(2);
      expect(updateSettingMock).toHaveBeenNthCalledWith(
        2,
        'zoomPercentage',
        80,
      );
    });

    // Zoom In
    await act(async () => {
      await userEvent.click(screen.getByTestId('settings-zoom-in'));
      await zoomTimeout();

      expect(updateSettingMock).toHaveBeenCalledTimes(3);
      expect(updateSettingMock).toHaveBeenNthCalledWith(
        3,
        'zoomPercentage',
        90,
      );
    });

    // Zoom Reset
    await act(async () => {
      await userEvent.click(screen.getByTestId('settings-zoom-reset'));
      await zoomTimeout();

      expect(updateSettingMock).toHaveBeenCalledTimes(4);
      expect(updateSettingMock).toHaveBeenNthCalledWith(
        4,
        'zoomPercentage',
        100,
      );
    });
  });

  it('should toggle account header checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<AppearanceSettings />, {
        auth: {
          accounts: [mockGitHubAppAccount],
        },
        updateSetting: updateSettingMock,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-showAccountHeader'));

    expect(updateSettingMock).toHaveBeenCalledTimes(1);
    expect(updateSettingMock).toHaveBeenCalledWith('showAccountHeader', true);
  });

  it('should toggle wrap notification title checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<AppearanceSettings />, {
        auth: {
          accounts: [mockGitHubAppAccount],
        },
        updateSetting: updateSettingMock,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-wrapNotificationTitle'));

    expect(updateSettingMock).toHaveBeenCalledTimes(1);
    expect(updateSettingMock).toHaveBeenCalledWith(
      'wrapNotificationTitle',
      true,
    );
  });
});
