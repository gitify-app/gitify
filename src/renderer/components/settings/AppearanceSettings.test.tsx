import { act, fireEvent, render, screen } from '@testing-library/react';
import { webFrame } from 'electron';
import { MemoryRouter } from 'react-router-dom';
import {
  mockAuth,
  mockGitHubAppAccount,
  mockSettings,
} from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import { AppearanceSettings } from './AppearanceSettings';

describe('renderer/routes/components/settings/AppearanceSettings.tsx', () => {
  const updateSetting = jest.fn();
  const zoomTimeout = () => new Promise((r) => setTimeout(r, 300));

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should change the theme mode dropdown', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <MemoryRouter>
            <AppearanceSettings />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    const select = screen.getByTestId('settings-theme') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'LIGHT' } });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('theme', 'LIGHT');
  });

  it('should update the zoom value when using CMD + and CMD -', async () => {
    webFrame.getZoomLevel = jest.fn().mockReturnValue(-1);

    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <MemoryRouter>
            <AppearanceSettings />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent(window, new Event('resize'));
    await zoomTimeout();

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('zoomPercentage', 50);
  });

  it('should update the zoom values when using the zoom buttons', async () => {
    webFrame.getZoomLevel = jest.fn().mockReturnValue(0);
    webFrame.setZoomLevel = jest.fn().mockImplementation((level) => {
      webFrame.getZoomLevel = jest.fn().mockReturnValue(level);
      fireEvent(window, new Event('resize'));
    });

    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <MemoryRouter>
            <AppearanceSettings />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('settings-zoom-out'));
      await zoomTimeout();
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('zoomPercentage', 90);

    await act(async () => {
      fireEvent.click(screen.getByTestId('settings-zoom-out'));
      await zoomTimeout();

      expect(updateSetting).toHaveBeenCalledTimes(2);
      expect(updateSetting).toHaveBeenNthCalledWith(2, 'zoomPercentage', 80);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('settings-zoom-in'));
      await zoomTimeout();

      expect(updateSetting).toHaveBeenCalledTimes(3);
      expect(updateSetting).toHaveBeenNthCalledWith(3, 'zoomPercentage', 90);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('settings-zoom-reset'));
      await zoomTimeout();

      expect(updateSetting).toHaveBeenCalledTimes(4);
      expect(updateSetting).toHaveBeenNthCalledWith(4, 'zoomPercentage', 100);
    });
  });

  it('should toggle detailed notifications checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <MemoryRouter>
            <AppearanceSettings />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByTestId('checkbox-detailedNotifications'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('detailedNotifications', false);
  });

  it('should toggle metric pills checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <MemoryRouter>
            <AppearanceSettings />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByTestId('checkbox-showPills'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('showPills', false);
  });

  it('should toggle show number checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <MemoryRouter>
            <AppearanceSettings />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByTestId('checkbox-showNumber'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('showNumber', false);
  });

  it('should toggle account header checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: {
              accounts: [mockGitHubAppAccount],
            },
            settings: mockSettings,
            updateSetting,
          }}
        >
          <MemoryRouter>
            <AppearanceSettings />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByTestId('checkbox-showAccountHeader'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('showAccountHeader', true);
  });
});
