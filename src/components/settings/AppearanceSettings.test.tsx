import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitHubAppAccount } from '../../__mocks__/account-mocks';

import * as zoom from '../../utils/zoom';
import { AppearanceSettings } from './AppearanceSettings';

describe('renderer/components/settings/AppearanceSettings.tsx', () => {
  const updateSettingMock = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
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

  it('should update the zoom values when using the zoom buttons', async () => {
    const zoomOutSpy = vi
      .spyOn(zoom, 'decreaseZoom')
      .mockImplementation(() => {});
    const zoomInSpy = vi
      .spyOn(zoom, 'increaseZoom')
      .mockImplementation(() => {});
    const zoomResetSpy = vi
      .spyOn(zoom, 'resetZoomLevel')
      .mockImplementation(() => {});

    await act(async () => {
      renderWithAppContext(<AppearanceSettings />, {
        updateSetting: updateSettingMock,
      });
    });

    // Zoom Out
    await userEvent.click(screen.getByTestId('settings-zoom-out'));
    expect(zoomOutSpy).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByTestId('settings-zoom-out'));
    expect(zoomOutSpy).toHaveBeenCalledTimes(2);

    // Zoom In
    await userEvent.click(screen.getByTestId('settings-zoom-in'));
    expect(zoomInSpy).toHaveBeenCalledTimes(1);

    // Zoom Reset
    await userEvent.click(screen.getByTestId('settings-zoom-reset'));
    expect(zoomResetSpy).toHaveBeenCalledTimes(1);
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
