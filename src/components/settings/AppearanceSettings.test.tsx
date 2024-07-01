import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockAuth, mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import { AppearanceSettings } from './AppearanceSettings';

global.ResizeObserver = require('resize-observer-polyfill');

describe('routes/components/AppearanceSettings.tsx', () => {
  const updateSetting = jest.fn();

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
