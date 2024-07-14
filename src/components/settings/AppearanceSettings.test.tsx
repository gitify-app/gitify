import { act, fireEvent, render, screen } from '@testing-library/react';
import { webFrame } from 'electron';
import { MemoryRouter } from 'react-router-dom';
import { mockAuth, mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import { AppearanceSettings } from './AppearanceSettings';

global.ResizeObserver = require('resize-observer-polyfill');

describe('routes/components/settings/AppearanceSettings.tsx', () => {
  const updateSetting = jest.fn();
  const zoomTimeout = () => new Promise((r) => setTimeout(r, 300));

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should change the theme radio group', async () => {
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

    fireEvent.click(screen.getByLabelText('Light'));

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
      fireEvent.click(screen.getByLabelText('Zoom Out'));
      await zoomTimeout();
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('zoomPercentage', 90);

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Zoom Out'));
      await zoomTimeout();

      expect(updateSetting).toHaveBeenCalledTimes(2);
      expect(updateSetting).toHaveBeenNthCalledWith(2, 'zoomPercentage', 80);
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Zoom In'));
      await zoomTimeout();

      expect(updateSetting).toHaveBeenCalledTimes(3);
      expect(updateSetting).toHaveBeenNthCalledWith(3, 'zoomPercentage', 90);
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Reset Zoom'));
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

    await screen.findByLabelText('Detailed notifications');

    fireEvent.click(screen.getByLabelText('Detailed notifications'));

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

    await screen.findByLabelText('Show notification metric pills');

    fireEvent.click(screen.getByLabelText('Show notification metric pills'));

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

    await screen.findByLabelText('Show number');

    fireEvent.click(screen.getByLabelText('Show number'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('showNumber', false);
  });

  it('should toggle account hostname checkbox', async () => {
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

    await screen.findByLabelText('Show account hostname');

    fireEvent.click(screen.getByLabelText('Show account hostname'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('showAccountHostname', true);
  });
});
