import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockAuth, mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import * as comms from '../../utils/comms';
import { SettingsFooter } from './SettingsFooter';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('routes/components/SettingsFooter.tsx', () => {
  const resetSettings = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('app version', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      // Save the original node env state
      originalEnv = process.env;
    });

    afterEach(() => {
      // Restore the original node env state
      process.env = originalEnv;
    });

    it('should show production app version', async () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: 'production',
      };

      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <SettingsFooter />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      expect(screen.getByTitle('app-version')).toMatchSnapshot();
    });

    it('should show development app version', async () => {
      process.env = {
        ...originalEnv,
        NODE_ENV: 'development',
      };

      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <SettingsFooter />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      expect(screen.getByTitle('app-version')).toMatchSnapshot();
    });
  });

  it('should open release notes', async () => {
    const openExternalLinkMock = jest.spyOn(comms, 'openExternalLink');

    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
          }}
        >
          <MemoryRouter>
            <SettingsFooter />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByTitle('View release notes'));

    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
    expect(openExternalLinkMock).toHaveBeenCalledWith(
      'https://github.com/gitify-app/gitify/releases/tag/v0.0.1',
    );
  });

  it('should reset default settings when `OK`', async () => {
    window.confirm = jest.fn(() => true); // always click 'OK'

    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            resetSettings,
          }}
        >
          <MemoryRouter>
            <SettingsFooter />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByTitle('Reset default settings'));
    expect(resetSettings).toHaveBeenCalled();
  });

  it('should skip reset default settings when `cancelled`', async () => {
    window.confirm = jest.fn(() => false); // always click 'cancel'

    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            resetSettings,
          }}
        >
          <MemoryRouter>
            <SettingsFooter />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByTitle('Reset default settings'));
    expect(resetSettings).not.toHaveBeenCalled();
  });

  it('should open account management', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
          }}
        >
          <MemoryRouter>
            <SettingsFooter />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByTitle('Accounts'));
    expect(mockNavigate).toHaveBeenCalledWith('/accounts');
  });

  it('should quit the app', async () => {
    const quitAppMock = jest.spyOn(comms, 'quitApp');

    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
          }}
        >
          <MemoryRouter>
            <SettingsFooter />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByTitle('Quit Gitify'));
    expect(quitAppMock).toHaveBeenCalledTimes(1);
  });
});
