import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';

import useSettingsStore from '../../stores/useSettingsStore';

import * as zoom from '../../utils/zoom';
import { AppearanceSettings } from './AppearanceSettings';

describe('renderer/components/settings/AppearanceSettings.tsx', () => {
  let updateSettingSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    updateSettingSpy = vi.spyOn(useSettingsStore.getState(), 'updateSetting');

    renderWithAppContext(<AppearanceSettings />);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should change the theme mode dropdown', async () => {
    await userEvent.selectOptions(
      screen.getByTestId('settings-theme'),
      'LIGHT',
    );

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('theme', 'LIGHT');
  });

  it('should toggle increase contrast checkbox', async () => {
    await userEvent.click(screen.getByTestId('checkbox-increaseContrast'));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('increaseContrast', true);
  });

  it('should update the zoom values when using the zoom buttons', async () => {
    const zoomOutSpy = vi
      .spyOn(zoom, 'decreaseZoom')
      .mockImplementation(vi.fn());
    const zoomInSpy = vi
      .spyOn(zoom, 'increaseZoom')
      .mockImplementation(vi.fn());
    const zoomResetSpy = vi
      .spyOn(zoom, 'resetZoomLevel')
      .mockImplementation(vi.fn());

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
    await userEvent.click(screen.getByTestId('checkbox-showAccountHeader'));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('showAccountHeader', true);
  });

  it('should toggle wrap notification title checkbox', async () => {
    await userEvent.click(screen.getByTestId('checkbox-wrapNotificationTitle'));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith(
      'wrapNotificationTitle',
      true,
    );
  });
});
