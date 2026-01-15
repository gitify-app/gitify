import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { renderWithAppContext } from '../__helpers__/test-utils';

import * as comms from '../utils/comms';
import { GlobalShortcuts } from './GlobalShortcuts';

const navigateMock = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigateMock,
}));

describe('components/GlobalShortcuts.tsx', () => {
  const fetchNotificationsMock = jest.fn();
  const updateSettingMock = jest.fn();
  const quitAppSpy = jest.spyOn(comms, 'quitApp').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('key bindings', () => {
    describe('home', () => {
      it('navigates home when pressing H key', async () => {
        renderWithAppContext(
          <MemoryRouter>
            <GlobalShortcuts />
          </MemoryRouter>,
        );

        await userEvent.keyboard('h');

        expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    describe('focus mode', () => {
      it('toggles focus when pressing W while logged in', async () => {
        renderWithAppContext(
          <MemoryRouter>
            <GlobalShortcuts />
          </MemoryRouter>,
          {
            updateSetting: updateSettingMock,
            isLoggedIn: true,
          },
        );

        await userEvent.keyboard('w');

        expect(updateSettingMock).toHaveBeenCalledWith('participating', true);
      });

      it('does not toggle focus mode when loading', async () => {
        renderWithAppContext(
          <MemoryRouter>
            <GlobalShortcuts />
          </MemoryRouter>,
          {
            updateSetting: updateSettingMock,
            status: 'loading',
            isLoggedIn: true,
          },
        );

        await userEvent.keyboard('w');

        expect(updateSettingMock).not.toHaveBeenCalled();
      });

      it('does not toggle focus mode when logged out', async () => {
        renderWithAppContext(
          <MemoryRouter>
            <GlobalShortcuts />
          </MemoryRouter>,
          {
            updateSetting: updateSettingMock,
            isLoggedIn: false,
          },
        );

        await userEvent.keyboard('w');

        expect(updateSettingMock).not.toHaveBeenCalled();
      });
    });

    describe('filters', () => {
      it('toggles filters when pressing F while logged in', async () => {
        renderWithAppContext(
          <MemoryRouter>
            <GlobalShortcuts />
          </MemoryRouter>,
          {
            isLoggedIn: true,
          },
        );

        await userEvent.keyboard('f');

        expect(navigateMock).toHaveBeenCalledWith('/filters');
      });

      it('does not toggle filters when logged out', async () => {
        renderWithAppContext(
          <MemoryRouter>
            <GlobalShortcuts />
          </MemoryRouter>,
          {
            isLoggedIn: false,
          },
        );

        await userEvent.keyboard('f');

        expect(navigateMock).not.toHaveBeenCalled();
      });
    });

    describe('refresh', () => {
      it('refreshes notifications when pressing R key', async () => {
        renderWithAppContext(
          <MemoryRouter>
            <GlobalShortcuts />
          </MemoryRouter>,
          {
            fetchNotifications: fetchNotificationsMock,
          },
        );

        await userEvent.keyboard('r');

        expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
        expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
      });

      it('does not refresh when status is loading', async () => {
        renderWithAppContext(
          <MemoryRouter>
            <GlobalShortcuts />
          </MemoryRouter>,
          {
            status: 'loading',
          },
        );

        await userEvent.keyboard('r');

        expect(fetchNotificationsMock).not.toHaveBeenCalled();
      });
    });

    describe('settings', () => {
      it('toggles settings when pressing S while logged in', async () => {
        renderWithAppContext(
          <MemoryRouter>
            <GlobalShortcuts />
          </MemoryRouter>,
          {
            isLoggedIn: true,
          },
        );

        await userEvent.keyboard('s');

        expect(navigateMock).toHaveBeenCalledWith('/settings');
      });

      it('does not toggle settings when logged out', async () => {
        renderWithAppContext(
          <MemoryRouter>
            <GlobalShortcuts />
          </MemoryRouter>,
          {
            isLoggedIn: false,
          },
        );

        await userEvent.keyboard('s');

        expect(navigateMock).not.toHaveBeenCalled();
      });
    });

    describe('accounts', () => {
      it('navigates to accounts when pressing A on settings route', async () => {
        renderWithAppContext(
          <MemoryRouter initialEntries={['/settings']}>
            <GlobalShortcuts />
          </MemoryRouter>,
          {
            isLoggedIn: true,
          },
        );

        await userEvent.keyboard('a');

        expect(navigateMock).toHaveBeenCalledWith('/accounts');
      });

      it('does not trigger accounts when not on settings route', async () => {
        renderWithAppContext(
          <MemoryRouter>
            <GlobalShortcuts />
          </MemoryRouter>,
          {
            isLoggedIn: true,
          },
        );

        await userEvent.keyboard('a');

        expect(navigateMock).not.toHaveBeenCalledWith('/accounts');
      });
    });

    describe('quit app', () => {
      it('quits the app when pressing Q on settings route', async () => {
        renderWithAppContext(
          <MemoryRouter initialEntries={['/settings']}>
            <GlobalShortcuts />
          </MemoryRouter>,
          {
            isLoggedIn: true,
          },
        );

        await userEvent.keyboard('q');

        expect(quitAppSpy).toHaveBeenCalledTimes(1);
      });

      it('does not quit the app when not on settings route', async () => {
        renderWithAppContext(
          <MemoryRouter>
            <GlobalShortcuts />
          </MemoryRouter>,
          {
            isLoggedIn: true,
          },
        );

        await userEvent.keyboard('q');

        expect(quitAppSpy).not.toHaveBeenCalled();
      });
    });

    describe('modifiers', () => {
      it('ignores shortcuts when typing in an input', async () => {
        renderWithAppContext(
          <MemoryRouter>
            <GlobalShortcuts />
            <input id="test-input" />
          </MemoryRouter>,
          {
            isLoggedIn: true,
          },
        );

        const input = document.getElementById(
          'test-input',
        ) as HTMLTextAreaElement;
        input.focus();
        await userEvent.type(input, 'h');

        expect(navigateMock).not.toHaveBeenCalled();
      });

      it('ignores shortcuts when typing in a textarea', async () => {
        renderWithAppContext(
          <MemoryRouter>
            <GlobalShortcuts />
            <textarea id="test-textarea" />
          </MemoryRouter>,
          {
            isLoggedIn: true,
          },
        );

        const textarea = document.getElementById(
          'test-textarea',
        ) as HTMLTextAreaElement;
        textarea.focus();
        await userEvent.type(textarea, 'h');

        expect(navigateMock).not.toHaveBeenCalled();
      });

      it('ignores shortcuts when modifier keys are pressed', async () => {
        renderWithAppContext(
          <MemoryRouter>
            <GlobalShortcuts />
          </MemoryRouter>,
          {
            isLoggedIn: true,
          },
        );

        const event = new KeyboardEvent('keydown', { key: 'h', metaKey: true });
        navigateMock.mockClear();
        document.dispatchEvent(event);

        expect(navigateMock).not.toHaveBeenCalled();
      });
    });
  });
});
