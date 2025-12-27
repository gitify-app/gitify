import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import * as comms from '../../utils/comms';
import { SettingsFooter } from './SettingsFooter';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => navigateMock,
}));

describe('renderer/components/settings/SettingsFooter.tsx', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save the original node env state
    originalEnv = process.env;
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.env = originalEnv;
  });

  it('should show app version', async () => {
    await act(async () => {
      renderWithAppContext(<SettingsFooter />);
    });

    expect(screen.getByTestId('settings-release-notes')).toMatchSnapshot();
  });

  it('should open release notes', async () => {
    const openExternalLinkSpy = vi
      .spyOn(comms, 'openExternalLink')
      .mockImplementation(() => {});

    await act(async () => {
      renderWithAppContext(<SettingsFooter />);
    });

    await userEvent.click(screen.getByTestId('settings-release-notes'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://github.com/gitify-app/gitify/releases/tag/v0.0.1',
    );
  });

  it('should open account management', async () => {
    await act(async () => {
      renderWithAppContext(<SettingsFooter />);
    });

    await userEvent.click(screen.getByTestId('settings-accounts'));

    expect(navigateMock).toHaveBeenCalledWith('/accounts');
  });

  it('should quit the app', async () => {
    const quitAppSpy = vi.spyOn(comms, 'quitApp').mockImplementation(() => {});

    await act(async () => {
      renderWithAppContext(<SettingsFooter />);
    });

    await userEvent.click(screen.getByTestId('settings-quit'));

    expect(quitAppSpy).toHaveBeenCalledTimes(1);
  });
});
