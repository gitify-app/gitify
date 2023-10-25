import React from 'react';
import TestRenderer, { ReactTestRenderer, act } from 'react-test-renderer';
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const { ipcRenderer } = require('electron');

import { SettingsRoute } from './Settings';
import { AppContext } from '../context/App';
import { mockSettings } from '../__mocks__/mock-state';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('routes/Settings', () => {
  const updateSetting = jest.fn();

  beforeEach(() => {
    mockNavigate.mockReset();
    updateSetting.mockReset();
  });

  it('should render itself & its children', async () => {
    let tree: ReactTestRenderer | null = null;

    await act(async () => {
      tree = TestRenderer.create(
        <AppContext.Provider value={{ settings: mockSettings }}>
          <BrowserRouter>
            <SettingsRoute />
          </BrowserRouter>
        </AppContext.Provider>,
      );
    });

    expect(tree).toMatchSnapshot();
  });

  it('should press the logout', async () => {
    const logoutMock = jest.fn();

    await act(async () => {
      const { getByLabelText } = render(
        <AppContext.Provider
          value={{ settings: mockSettings, logout: logoutMock }}
        >
          <BrowserRouter>
            <SettingsRoute />
          </BrowserRouter>
        </AppContext.Provider>,
      );

      fireEvent.click(getByLabelText('Logout'));
    });

    expect(logoutMock).toHaveBeenCalledTimes(1);

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('update-icon');
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should go back by pressing the icon', async () => {
    await act(async () => {
      const { getByLabelText } = render(
        <AppContext.Provider value={{ settings: mockSettings }}>
          <BrowserRouter>
            <SettingsRoute />
          </BrowserRouter>
        </AppContext.Provider>,
      );

      fireEvent.click(getByLabelText('Go Back'));
    });
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should toggle the showOnlyParticipating checkbox', async () => {
    await act(async () => {
      const { getByLabelText } = render(
        <AppContext.Provider value={{ settings: mockSettings, updateSetting }}>
          <BrowserRouter>
            <SettingsRoute />
          </BrowserRouter>
        </AppContext.Provider>,
      );
      fireEvent.click(getByLabelText('Show only participating'), {
        target: { checked: true },
      });
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('participating', false);
  });

  it('should toggle the playSound checkbox', async () => {
    await act(async () => {
      const { getByLabelText } = render(
        <AppContext.Provider value={{ settings: mockSettings, updateSetting }}>
          <BrowserRouter>
            <SettingsRoute />
          </BrowserRouter>
        </AppContext.Provider>,
      );
      fireEvent.click(getByLabelText('Play sound'), {
        target: { checked: true },
      });
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('playSound', false);
  });

  it('should toggle the showNotifications checkbox', async () => {
    await act(async () => {
      const { getByLabelText } = render(
        <AppContext.Provider value={{ settings: mockSettings, updateSetting }}>
          <BrowserRouter>
            <SettingsRoute />
          </BrowserRouter>
        </AppContext.Provider>,
      );
      fireEvent.click(getByLabelText('Show notifications'), {
        target: { checked: true },
      });
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('showNotifications', false);
  });

  it('should toggle the onClickMarkAsRead checkbox', async () => {
    await act(async () => {
      const { getByLabelText } = render(
        <AppContext.Provider value={{ settings: mockSettings, updateSetting }}>
          <BrowserRouter>
            <SettingsRoute />
          </BrowserRouter>
        </AppContext.Provider>,
      );
      fireEvent.click(getByLabelText('Mark as read on click'), {
        target: { checked: true },
      });
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('markOnClick', false);
  });

  it('should toggle the openAtStartup checkbox', async () => {
    await act(async () => {
      const { getByLabelText } = render(
        <AppContext.Provider value={{ settings: mockSettings, updateSetting }}>
          <BrowserRouter>
            <SettingsRoute />
          </BrowserRouter>
        </AppContext.Provider>,
      );
      fireEvent.click(getByLabelText('Open at startup'), {
        target: { checked: true },
      });
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('openAtStartup', false);
  });

  it('should change the appearance radio group', async () => {
    await act(async () => {
      const { getByLabelText } = render(
        <AppContext.Provider value={{ settings: mockSettings, updateSetting }}>
          <BrowserRouter>
            <SettingsRoute />
          </BrowserRouter>
        </AppContext.Provider>,
      );
      fireEvent.click(getByLabelText('Light'));
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('appearance', 'LIGHT');
  });

  it('should go to the enterprise login route', async () => {
    await act(async () => {
      const { getByLabelText } = render(
        <AppContext.Provider value={{ settings: mockSettings }}>
          <BrowserRouter>
            <SettingsRoute />
          </BrowserRouter>
        </AppContext.Provider>,
      );
      fireEvent.click(getByLabelText('Login with GitHub Enterprise'));
    });

    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/login-enterprise', {
      replace: true,
    });
  });

  it('should quit the app', async () => {
    await act(async () => {
      const { getByLabelText } = render(
        <AppContext.Provider value={{ settings: mockSettings }}>
          <BrowserRouter>
            <SettingsRoute />
          </BrowserRouter>
        </AppContext.Provider>,
      );
      fireEvent.click(getByLabelText('Quit Gitify'));
    });

    expect(ipcRenderer.send).toHaveBeenCalledWith('app-quit');
  });
});
