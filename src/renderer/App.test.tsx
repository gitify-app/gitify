import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockSettings } from './__mocks__/state-mocks';
import { App } from './App';
import * as comms from './utils/comms';

const navigateMock = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigateMock,
}));

// Provide a mutable mock context for useAppContext consumed by global shortcuts
let mockContext: {
  fetchNotifications: jest.Mock;
  isLoggedIn: boolean;
  status: 'success' | 'loading' | 'error';
  settings: typeof mockSettings;
  updateSetting: jest.Mock;
  auth: { accounts: Array<{ hostname: string }> };
  notifications: unknown[];
} = {
  fetchNotifications: jest.fn(),
  isLoggedIn: true,
  status: 'success',
  settings: { ...mockSettings, participating: false },
  updateSetting: jest.fn(),
  auth: { accounts: [{ hostname: 'github.com' }] },
  notifications: [],
};
jest.mock('./context/App', () => {
  const actual = jest.requireActual('./context/App');
  return {
    ...actual,
    useAppContext: () => mockContext,
  };
});

describe('renderer/App.tsx global keyboard bindings', () => {
  const fetchNotificationsMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext = {
      // minimal shape required by useGlobalShortcuts
      fetchNotifications: fetchNotificationsMock,
      isLoggedIn: true,
      status: 'success',
      settings: { ...mockSettings, participating: false },
      updateSetting: jest.fn(),
      auth: { accounts: [{ hostname: 'github.com' }] },
      notifications: [],
    };
  });

  it('should navigate home when pressing H key', async () => {
    renderApp();
    await userEvent.keyboard('h');
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });

  it('should refresh notifications when pressing R key', async () => {
    mockContext.status = 'success';
    renderApp();
    await userEvent.keyboard('r');
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
    expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
  });

  it('should not refresh notifications when pressing R key if status is loading', async () => {
    mockContext.status = 'loading';
    renderApp();
    await userEvent.keyboard('r');
    expect(fetchNotificationsMock).not.toHaveBeenCalled();
  });

  it('should toggle settings when pressing S key while logged in', async () => {
    mockContext.isLoggedIn = true;
    renderApp();
    await userEvent.keyboard('s');
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/settings');
  });

  it('should not toggle settings when pressing S key while logged out', async () => {
    mockContext.isLoggedIn = false;
    renderApp();
    await userEvent.keyboard('s');
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('should toggle filters when pressing F key while logged in', async () => {
    mockContext.isLoggedIn = true;
    renderApp();
    await userEvent.keyboard('f');
    expect(navigateMock).toHaveBeenCalledWith('/filters');
  });

  it('should not toggle filters when pressing F key while logged out', async () => {
    mockContext.isLoggedIn = false;
    renderApp();
    await userEvent.keyboard('f');
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('should ignore keyboard shortcuts when typing in an input', async () => {
    renderApp();
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    navigateMock.mockClear();
    await userEvent.keyboard('h');
    expect(navigateMock).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('should ignore keyboard shortcuts when typing in a textarea', async () => {
    renderApp();
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();
    navigateMock.mockClear();
    await userEvent.keyboard('r');
    expect(navigateMock).not.toHaveBeenCalled();
    expect(fetchNotificationsMock).not.toHaveBeenCalled();
    document.body.removeChild(textarea);
  });

  it('should ignore keyboard shortcuts when modifier keys are pressed', async () => {
    mockContext.status = 'success';
    renderApp();
    const event = new KeyboardEvent('keydown', { key: 'h', metaKey: true });
    navigateMock.mockClear();
    document.dispatchEvent(event);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('should work with uppercase key press', async () => {
    renderApp();
    await userEvent.keyboard('H');
    expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
  });

  it('should navigate to accounts when pressing A key while logged in', async () => {
    mockContext.isLoggedIn = true;
    renderApp('#/settings');
    // Go to settings first; accounts shortcut only active on settings route
    await userEvent.keyboard('s');
    await userEvent.keyboard('a');
    expect(navigateMock).toHaveBeenCalledWith('/accounts');
  });

  it('should quit the app when pressing Q key', async () => {
    const quitAppSpy = jest.spyOn(comms, 'quitApp').mockImplementation();
    renderApp('#/settings');
    // Go to settings first; quit shortcut only active on settings route
    await userEvent.keyboard('s');
    await userEvent.keyboard('q');
    expect(quitAppSpy).toHaveBeenCalledTimes(1);
  });

  it('should not trigger accounts when not on settings route', async () => {
    mockContext.isLoggedIn = true;
    renderApp('#/');
    await userEvent.keyboard('a');
    expect(navigateMock).not.toHaveBeenCalledWith('/accounts');
  });

  it('should not quit the app when not on settings route', async () => {
    const quitAppSpy = jest.spyOn(comms, 'quitApp').mockImplementation();
    renderApp('#/');
    await userEvent.keyboard('q');
    expect(quitAppSpy).not.toHaveBeenCalled();
  });
});

function renderApp(initialHash?: string) {
  if (initialHash) {
    window.location.hash = initialHash;
  }
  return render(<App />);
}
