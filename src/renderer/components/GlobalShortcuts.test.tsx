import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';

import { useSettingsStore } from '../stores';

import * as comms from '../utils/system/comms';
import * as links from '../utils/system/links';
import { GlobalShortcuts } from './GlobalShortcuts';

describe('components/GlobalShortcuts.tsx', () => {
  const fetchNotificationsMock = vi.fn();
  const quitAppSpy = vi.spyOn(comms, 'quitApp').mockImplementation(vi.fn());

  let updateSettingSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    updateSettingSpy = vi.spyOn(useSettingsStore.getState(), 'updateSetting');
  });

  describe('key bindings', () => {
    describe('ignores keys that are not valid', () => {
      it('ignores B key', async () => {
        renderWithProviders(<GlobalShortcuts />);

        await userEvent.keyboard('b');

        expect(navigateMock).not.toHaveBeenCalled();
      });
    });

    describe('home', () => {
      it('navigates home when pressing H key', async () => {
        renderWithProviders(<GlobalShortcuts />);

        await userEvent.keyboard('h');

        expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    describe('openHostNotifications', () => {
      const openHostNotificationsSpy = vi
        .spyOn(links, 'openHostNotifications')
        .mockImplementation(vi.fn());

      it('opens primary account GitHub notifications webpage when pressing N while logged in', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          accounts: [mockGitHubCloudAccount],
        });

        await userEvent.keyboard('n');

        expect(openHostNotificationsSpy).toHaveBeenCalledTimes(1);
      });

      it('does not open primary account GitHub notifications webpage when logged out', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          accounts: [],
        });

        await userEvent.keyboard('n');

        expect(openHostNotificationsSpy).not.toHaveBeenCalled();
      });
    });

    describe('focus mode', () => {
      it('toggles focus when pressing W while logged in', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          accounts: [mockGitHubCloudAccount],
        });

        await userEvent.keyboard('w');

        expect(updateSettingSpy).toHaveBeenCalledWith('participating', true);
      });

      it('does not toggle focus mode when loading', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          status: 'loading',
          accounts: [mockGitHubCloudAccount],
        });

        await userEvent.keyboard('w');

        expect(updateSettingSpy).not.toHaveBeenCalled();
      });

      it('does not toggle focus mode when logged out', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          accounts: [],
        });

        await userEvent.keyboard('w');

        expect(updateSettingSpy).not.toHaveBeenCalled();
      });
    });

    describe('filters', () => {
      it('toggles filters when pressing F while logged in', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          accounts: [mockGitHubCloudAccount],
        });

        await userEvent.keyboard('f');

        expect(navigateMock).toHaveBeenCalledWith('/filters');
      });

      it('does not toggle filters when logged out', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          accounts: [],
        });

        await userEvent.keyboard('f');

        expect(navigateMock).not.toHaveBeenCalled();
      });
    });

    describe('openHostIssues', () => {
      const openHostIssuesSpy = vi.spyOn(links, 'openHostIssues').mockImplementation(vi.fn());

      it('opens primary account GitHub issues webpage when pressing I while logged in', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          accounts: [mockGitHubCloudAccount],
        });

        await userEvent.keyboard('i');

        expect(openHostIssuesSpy).toHaveBeenCalledTimes(1);
      });

      it('does not open primary account GitHub issues webpage when logged out', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          accounts: [],
        });

        await userEvent.keyboard('n');

        expect(openHostIssuesSpy).not.toHaveBeenCalled();
      });
    });

    describe('openHostPulls', () => {
      const openHostPullsSpy = vi.spyOn(links, 'openHostPulls').mockImplementation(vi.fn());

      it('opens primary account GitHub pull requests webpage when pressing N while logged in', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          accounts: [mockGitHubCloudAccount],
        });

        await userEvent.keyboard('p');

        expect(openHostPullsSpy).toHaveBeenCalledTimes(1);
      });

      it('does not open primary account GitHub pull requests webpage when logged out', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          accounts: [],
        });

        await userEvent.keyboard('n');

        expect(openHostPullsSpy).not.toHaveBeenCalled();
      });
    });

    describe('refresh', () => {
      it('refreshes notifications when pressing R key', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          fetchNotifications: fetchNotificationsMock,
        });

        await userEvent.keyboard('r');

        expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
        expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
      });

      it('does not refresh when status is loading', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          status: 'loading',
        });

        await userEvent.keyboard('r');

        expect(fetchNotificationsMock).not.toHaveBeenCalled();
      });
    });

    describe('settings', () => {
      it('toggles settings when pressing S while logged in', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          accounts: [mockGitHubCloudAccount],
        });

        await userEvent.keyboard('s');

        expect(navigateMock).toHaveBeenCalledWith('/settings');
      });

      it('does not toggle settings when logged out', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          accounts: [],
        });

        await userEvent.keyboard('s');

        expect(navigateMock).not.toHaveBeenCalled();
      });
    });

    describe('accounts', () => {
      it('navigates to accounts when pressing A on settings route', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          initialEntries: ['/settings'],
          accounts: [mockGitHubCloudAccount],
        });

        await userEvent.keyboard('a');

        expect(navigateMock).toHaveBeenCalledWith('/accounts');
      });

      it('does not trigger accounts when not on settings route', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          accounts: [mockGitHubCloudAccount],
        });

        await userEvent.keyboard('a');

        expect(navigateMock).not.toHaveBeenCalledWith('/accounts');
      });
    });

    describe('quit app', () => {
      it('quits the app when pressing Q on settings route', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          initialEntries: ['/settings'],
          accounts: [mockGitHubCloudAccount],
        });

        await userEvent.keyboard('q');

        expect(quitAppSpy).toHaveBeenCalledTimes(1);
      });

      it('does not quit the app when not on settings route', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          accounts: [mockGitHubCloudAccount],
        });

        await userEvent.keyboard('q');

        expect(quitAppSpy).not.toHaveBeenCalled();
      });
    });

    describe('modifiers', () => {
      it('ignores shortcuts when typing in an input', async () => {
        renderWithProviders(
          <>
            <GlobalShortcuts />
            <input id="test-input" />
          </>,
          {
            accounts: [mockGitHubCloudAccount],
          },
        );

        const input = document.getElementById('test-input') as HTMLTextAreaElement;
        input.focus();
        await userEvent.type(input, 'h');

        expect(navigateMock).not.toHaveBeenCalled();
      });

      it('ignores shortcuts when typing in a textarea', async () => {
        renderWithProviders(
          <>
            <GlobalShortcuts />
            <textarea id="test-textarea" />
          </>,
          {
            accounts: [mockGitHubCloudAccount],
          },
        );

        const textarea = document.getElementById('test-textarea') as HTMLTextAreaElement;
        textarea.focus();
        await userEvent.type(textarea, 'h');

        expect(navigateMock).not.toHaveBeenCalled();
      });

      it('ignores shortcuts when modifier keys are pressed', async () => {
        renderWithProviders(<GlobalShortcuts />, {
          accounts: [mockGitHubCloudAccount],
        });

        const event = new KeyboardEvent('keydown', { key: 'h', metaKey: true });
        navigateMock.mockClear();
        document.dispatchEvent(event);

        expect(navigateMock).not.toHaveBeenCalled();
      });
    });
  });
});
