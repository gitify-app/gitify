import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('renderer/components/settings/SettingsFooter.tsx', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save the original node env state
    originalEnv = process.env;
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env = originalEnv;
  });

  it('should show app version', async () => {
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

    expect(screen.getByTestId('settings-release-notes')).toMatchSnapshot();
  });

  it('should open release notes', async () => {
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

    await userEvent.click(screen.getByTestId('settings-release-notes'));

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

    await userEvent.click(screen.getByTestId('settings-accounts'));

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

    await userEvent.click(screen.getByTestId('settings-quit'));

    expect(quitAppMock).toHaveBeenCalledTimes(1);
  });
});
