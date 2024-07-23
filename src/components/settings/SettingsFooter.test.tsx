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

global.ResizeObserver = require('resize-observer-polyfill');

describe('routes/components/settings/SettingsFooter.tsx', () => {
  afterEach(() => {
    jest.clearAllMocks();
    process.env = originalEnv;
  });

  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save the original node env state
    originalEnv = process.env;
  });

  describe('app version', () => {
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

      expect(screen.getByLabelText('app-version')).toMatchSnapshot();
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

      expect(screen.getByLabelText('app-version')).toMatchSnapshot();
    });
  });

  describe('update available visual indicator', () => {
    it('using latest version', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <SettingsFooter isUpdateAvailable={false} />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      expect(
        screen.getByTitle('You are using the latest version'),
      ).toMatchSnapshot();
    });

    it('new version available', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <SettingsFooter isUpdateAvailable={true} />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      expect(screen.getByTitle('New version available')).toMatchSnapshot();
    });
  });

  it('should open release notes', async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
    };
    const openExternalLinkMock = jest
      .spyOn(comms, 'openExternalLink')
      .mockImplementation();

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
