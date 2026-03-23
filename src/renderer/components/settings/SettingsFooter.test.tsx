import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  navigateMock,
  renderWithProviders,
} from '../../__helpers__/test-utils';

import * as comms from '../../utils/system/comms';
import { SettingsFooter } from './SettingsFooter';

describe('renderer/components/settings/SettingsFooter.tsx', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should show app version', async () => {
    await act(async () => {
      renderWithProviders(<SettingsFooter />, {
        initialEntries: ['/settings'],
      });
    });

    expect(screen.getByTestId('settings-release-notes')).toMatchSnapshot();
  });

  it('should open release notes', async () => {
    const openExternalLinkSpy = vi
      .spyOn(comms, 'openExternalLink')
      .mockImplementation(vi.fn());

    await act(async () => {
      renderWithProviders(<SettingsFooter />, {
        initialEntries: ['/settings'],
      });
    });

    await userEvent.click(screen.getByTestId('settings-release-notes'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://github.com/gitify-app/gitify/releases/tag/v0.0.1',
    );
  });

  it('should open account management', async () => {
    await act(async () => {
      renderWithProviders(<SettingsFooter />, {
        initialEntries: ['/settings'],
      });
    });

    await userEvent.click(screen.getByTestId('settings-accounts'));

    expect(navigateMock).toHaveBeenCalledWith('/accounts');
  });

  it('should quit the app', async () => {
    const quitAppSpy = vi.spyOn(comms, 'quitApp').mockImplementation(vi.fn());

    await act(async () => {
      renderWithProviders(<SettingsFooter />, {
        initialEntries: ['/settings'],
      });
    });

    await userEvent.click(screen.getByTestId('settings-quit'));

    expect(quitAppSpy).toHaveBeenCalledTimes(1);
  });
});
