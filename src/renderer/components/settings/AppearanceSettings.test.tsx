import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import {
  mockGitHubAppAccount,
  mockSettings,
} from '../../__mocks__/state-mocks';
import { AppearanceSettings } from './AppearanceSettings';

describe('renderer/components/settings/AppearanceSettings.tsx', () => {
  const mockUpdateSetting = jest.fn();
  const zoomTimeout = () => new Promise((r) => setTimeout(r, 300));

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should change the theme mode dropdown', async () => {
    await act(async () => {
      renderWithAppContext(<AppearanceSettings />, {
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.selectOptions(
      screen.getByTestId('settings-theme'),
      'LIGHT',
    );

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith('theme', 'LIGHT');
  });

  it('should toggle increase contrast checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<AppearanceSettings />, {
        auth: {
          accounts: [mockGitHubAppAccount],
        },
        settings: mockSettings,
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-increaseContrast'));

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith('increaseContrast', true);
  });

  it('should update the zoom value when using CMD + and CMD -', async () => {
    window.gitify.zoom.getLevel = jest.fn().mockReturnValue(-1);

    await act(async () => {
      renderWithAppContext(<AppearanceSettings />, {
        updateSetting: mockUpdateSetting,
      });
    });

    fireEvent(window, new Event('resize'));
    await zoomTimeout();

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith('zoomPercentage', 50);
  });

  it('should update the zoom values when using the zoom buttons', async () => {
    window.gitify.zoom.getLevel = jest.fn().mockReturnValue(0);
    window.gitify.zoom.setLevel = jest.fn().mockImplementation((level) => {
      window.gitify.zoom.getLevel = jest.fn().mockReturnValue(level);
      fireEvent(window, new Event('resize'));
    });

    await act(async () => {
      renderWithAppContext(<AppearanceSettings />, {
        updateSetting: mockUpdateSetting,
      });
    });

    // Zoom Out
    await act(async () => {
      await userEvent.click(screen.getByTestId('settings-zoom-out'));
      await zoomTimeout();

      expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
      expect(mockUpdateSetting).toHaveBeenCalledWith('zoomPercentage', 90);
    });

    await act(async () => {
      await userEvent.click(screen.getByTestId('settings-zoom-out'));
      await zoomTimeout();

      expect(mockUpdateSetting).toHaveBeenCalledTimes(2);
      expect(mockUpdateSetting).toHaveBeenNthCalledWith(
        2,
        'zoomPercentage',
        80,
      );
    });

    // Zoom In
    await act(async () => {
      await userEvent.click(screen.getByTestId('settings-zoom-in'));
      await zoomTimeout();

      expect(mockUpdateSetting).toHaveBeenCalledTimes(3);
      expect(mockUpdateSetting).toHaveBeenNthCalledWith(
        3,
        'zoomPercentage',
        90,
      );
    });

    // Zoom Reset
    await act(async () => {
      await userEvent.click(screen.getByTestId('settings-zoom-reset'));
      await zoomTimeout();

      expect(mockUpdateSetting).toHaveBeenCalledTimes(4);
      expect(mockUpdateSetting).toHaveBeenNthCalledWith(
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
        settings: mockSettings,
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-showAccountHeader'));

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith('showAccountHeader', true);
  });

  it('should toggle wrap notification title checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<AppearanceSettings />, {
        auth: {
          accounts: [mockGitHubAppAccount],
        },
        settings: mockSettings,
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-wrapNotificationTitle'));

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith(
      'wrapNotificationTitle',
      true,
    );
  });
});
