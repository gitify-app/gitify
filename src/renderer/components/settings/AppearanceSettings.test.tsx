import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { Constants } from '../../constants';

import { useSettingsStore } from '../../stores';

import { DesignLanguage } from '../../types';

import i18n from '../../i18n';
import * as zoom from '../../utils/ui/zoom';
import { AppearanceSettings } from './AppearanceSettings';

describe('renderer/components/settings/AppearanceSettings.tsx', () => {
  let toggleSettingSpy: ReturnType<typeof vi.spyOn>;
  let updateSettingSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    toggleSettingSpy = vi.spyOn(useSettingsStore.getState(), 'toggleSetting');
    updateSettingSpy = vi.spyOn(useSettingsStore.getState(), 'updateSetting');
  });

  it('changes the theme mode dropdown', async () => {
    await act(async () => {
      renderWithProviders(<AppearanceSettings />);
    });

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Theme' }), 'LIGHT');

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('theme', 'LIGHT');
  });

  it('changes the design language dropdown', async () => {
    await act(async () => {
      renderWithProviders(<AppearanceSettings />);
    });

    await userEvent.click(screen.getByRole('button', { name: 'Glass' }));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('designLanguage', DesignLanguage.GLASS);
  });

  it('should render English as the only available language', async () => {
    await act(async () => {
      renderWithProviders(<AppearanceSettings />);
    });

    expect(screen.getByTestId('settings-language')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();

    const languageSelect = screen.getByTestId('settings-language');
    const options = within(languageSelect).getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveValue('en');
  });

  it('should change the interface language and persist it to localStorage', async () => {
    const changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage');

    await act(async () => {
      renderWithProviders(<AppearanceSettings />);
    });

    await userEvent.selectOptions(screen.getByTestId('settings-language'), 'en');

    expect(changeLanguageSpy).toHaveBeenCalledWith('en');

    await waitFor(() => {
      expect(localStorage.getItem(Constants.STORAGE.LANGUAGE)).toBe('en');
    });
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

  it('updates the zoom values when using the zoom buttons', async () => {
    const zoomOutSpy = vi.spyOn(zoom, 'decreaseZoom').mockImplementation(vi.fn());
    const zoomInSpy = vi.spyOn(zoom, 'increaseZoom').mockImplementation(vi.fn());
    const zoomResetSpy = vi.spyOn(zoom, 'resetZoomLevel').mockImplementation(vi.fn());

    await act(async () => {
      renderWithProviders(<AppearanceSettings />);
    });

    // Zoom Out
    await userEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(zoomOutSpy).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(zoomOutSpy).toHaveBeenCalledTimes(2);

    // Zoom In
    await userEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(zoomInSpy).toHaveBeenCalledTimes(1);

    // Zoom Reset
    await userEvent.click(screen.getByRole('button', { name: 'Reset zoom' }));
    expect(zoomResetSpy).toHaveBeenCalledTimes(1);
  });

  it('toggles the increase contrast checkbox', async () => {
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

  it('toggles the status icon colors checkbox for Glass', async () => {
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

    await userEvent.click(screen.getByRole('button', { name: 'Help: Design' }));
    expect(
      screen.getByText(
        'Choose Classic for the original Gitify layout, or Glass for the translucent, layered design language.',
      ),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Help: Theme' }));
    expect(
      screen.getByText(
        'Choose a light, dark, or system color mode. Available options depend on the selected design language.',
      ),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Help: Zoom' }));
    expect(
      screen.getByText(
        'Change the size of the Gitify interface. The setting applies immediately and is remembered for the next launch.',
      ),
    ).toBeInTheDocument();
  });
});
