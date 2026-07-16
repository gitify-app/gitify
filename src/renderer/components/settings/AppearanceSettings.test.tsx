import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockGitHubAppAccount } from '../../__mocks__/account-mocks';

import { useSettingsStore } from '../../stores';

import * as zoom from '../../utils/ui/zoom';
import { AppearanceSettings } from './AppearanceSettings';

describe('renderer/components/settings/AppearanceSettings.tsx', () => {
  let toggleSettingSpy: ReturnType<typeof vi.spyOn>;
  let updateSettingSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    toggleSettingSpy = vi.spyOn(useSettingsStore.getState(), 'toggleSetting');
    updateSettingSpy = vi.spyOn(useSettingsStore.getState(), 'updateSetting');
  });

  it('should change the theme mode dropdown', async () => {
    await act(async () => {
      renderWithProviders(<AppearanceSettings />);
    });

    await userEvent.selectOptions(screen.getByTestId('settings-theme'), 'LIGHT');

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('theme', 'LIGHT');
  });

  it('should toggle increase contrast checkbox', async () => {
    await act(async () => {
      renderWithProviders(<AppearanceSettings />, {
        accounts: [mockGitHubAppAccount],
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-increaseContrast'));

    expect(toggleSettingSpy).toHaveBeenCalledTimes(1);
    expect(toggleSettingSpy).toHaveBeenCalledWith('increaseContrast');
  });

  it('should update the zoom values when using the zoom buttons', async () => {
    const zoomOutSpy = vi.spyOn(zoom, 'decreaseZoom').mockImplementation(vi.fn());
    const zoomInSpy = vi.spyOn(zoom, 'increaseZoom').mockImplementation(vi.fn());
    const zoomResetSpy = vi.spyOn(zoom, 'resetZoomLevel').mockImplementation(vi.fn());

    await act(async () => {
      renderWithProviders(<AppearanceSettings />);
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
      renderWithProviders(<AppearanceSettings />, {
        accounts: [mockGitHubAppAccount],
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-showAccountHeader'));

    expect(toggleSettingSpy).toHaveBeenCalledTimes(1);
    expect(toggleSettingSpy).toHaveBeenCalledWith('showAccountHeader');
  });

  it('should toggle wrap notification title checkbox', async () => {
    await act(async () => {
      renderWithProviders(<AppearanceSettings />, {
        accounts: [mockGitHubAppAccount],
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-wrapNotificationTitle'));

    expect(toggleSettingSpy).toHaveBeenCalledTimes(1);
    expect(toggleSettingSpy).toHaveBeenCalledWith('wrapNotificationTitle');
  });
});
