import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { renderWithAppContext } from '../../__helpers__/test-utils';

import * as comms from '../../utils/comms';
import { SettingsFooter } from './SettingsFooter';

const navigateMock = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.requireActual('react-router-dom'),
  useNavigate: () => navigateMock,
}));

describe('renderer/components/settings/SettingsFooter.tsx', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.env = originalEnv;
  });

  it('should show app version', async () => {
    await act(async () => {
      renderWithAppContext(
        <MemoryRouter initialEntries={['/settings']}>
          <SettingsFooter />
        </MemoryRouter>,
      );
    });

    expect(screen.getByTestId('settings-release-notes')).toMatchSnapshot();
  });

  it('should open release notes', async () => {
    const openExternalLinkSpy = vi
      .spyOn(comms, 'openExternalLink')
      .mockImplementation(vi.fn());

    await act(async () => {
      renderWithAppContext(
        <MemoryRouter initialEntries={['/settings']}>
          <SettingsFooter />
        </MemoryRouter>,
      );
    });

    await userEvent.click(screen.getByTestId('settings-release-notes'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://github.com/gitify-app/gitify/releases/tag/v0.0.1',
    );
  });

  it('should open account management', async () => {
    await act(async () => {
      renderWithAppContext(
        <MemoryRouter initialEntries={['/settings']}>
          <SettingsFooter />
        </MemoryRouter>,
      );
    });

    await userEvent.click(screen.getByTestId('settings-accounts'));

    expect(navigateMock).toHaveBeenCalledWith('/accounts');
  });

  it('should quit the app', async () => {
    const quitAppSpy = vi.spyOn(comms, 'quitApp').mockImplementation(vi.fn());

    await act(async () => {
      renderWithAppContext(
        <MemoryRouter initialEntries={['/settings']}>
          <SettingsFooter />
        </MemoryRouter>,
      );
    });

    await userEvent.click(screen.getByTestId('settings-quit'));

    expect(quitAppSpy).toHaveBeenCalledTimes(1);
  });
});
