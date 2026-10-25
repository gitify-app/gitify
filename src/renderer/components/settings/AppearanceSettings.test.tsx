import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { useSettingsStore } from '../../stores';

import { DesignLanguage } from '../../types';

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

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Theme' }), 'LIGHT');

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('theme', 'LIGHT');
  });

  it('should change the design language dropdown', async () => {
    await act(async () => {
      renderWithProviders(<AppearanceSettings />);
    });

    await userEvent.click(screen.getByTestId('choice-designLanguage-glass'));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('designLanguage', DesignLanguage.GLASS);
  });

  it('hides accessibility color modes when Glass is the active design language', async () => {
    await act(async () => {
      renderWithProviders(<AppearanceSettings />, {
        settings: { designLanguage: DesignLanguage.GLASS },
      });
    });

    expect(screen.getByRole('option', { name: 'System' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Dark default' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Soft dark' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Light colorblind' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Dark Tritanopia' })).not.toBeInTheDocument();
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

  it('should toggle the increase contrast checkbox', async () => {
    await act(async () => {
      renderWithProviders(<AppearanceSettings />);
    });

    await userEvent.click(screen.getByRole('button', { name: 'Increase contrast' }));

    expect(toggleSettingSpy).toHaveBeenCalledTimes(1);
    expect(toggleSettingSpy).toHaveBeenCalledWith('increaseContrast');
  });

  it('hides the increase contrast checkbox for Glass', async () => {
    await act(async () => {
      renderWithProviders(<AppearanceSettings />, {
        settings: { designLanguage: DesignLanguage.GLASS },
      });
    });

    expect(screen.queryByTestId('switch-increaseContrast')).not.toBeInTheDocument();
  });

  it('should toggle the status icon colors checkbox for Glass', async () => {
    await act(async () => {
      renderWithProviders(<AppearanceSettings />, {
        settings: { designLanguage: DesignLanguage.GLASS },
      });
    });

    await userEvent.click(screen.getByRole('button', { name: 'Show status icon colors' }));

    expect(toggleSettingSpy).toHaveBeenCalledTimes(1);
    expect(toggleSettingSpy).toHaveBeenCalledWith('showStatusIconColors');
  });

  it('hides the status icon colors checkbox for Classic', async () => {
    await act(async () => {
      renderWithProviders(<AppearanceSettings />);
    });

    expect(screen.queryByTestId('switch-showStatusIconColors')).not.toBeInTheDocument();
  });

  it('shows detailed help in the tooltips', async () => {
    await act(async () => {
      renderWithProviders(<AppearanceSettings />);
    });

    await userEvent.click(screen.getByTestId('tooltip-icon-tooltip-designLanguage'));
    expect(
      screen.getByText(
        'Choose Classic for the original Gitify layout, or Glass for the translucent, layered design language.',
      ),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('tooltip-icon-tooltip-theme'));
    expect(
      screen.getByText(
        'Choose a light, dark, or system color mode. Available options depend on the selected design language.',
      ),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('tooltip-icon-tooltip-zoom'));
    expect(
      screen.getByText(
        'Change the size of the Gitify interface. The setting applies immediately and is remembered for the next launch.',
      ),
    ).toBeInTheDocument();
  });
});
