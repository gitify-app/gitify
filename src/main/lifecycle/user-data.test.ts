const getPathMock = vi.fn(() => '/User/Data');
const setPathMock = vi.fn();
const isPackagedMock = vi.fn(() => true);

vi.mock('electron', () => ({
  app: {
    get getPath() {
      return () => getPathMock();
    },
    get isPackaged() {
      return isPackagedMock();
    },
    setPath: (...a: unknown[]) => setPathMock(...a),
  } satisfies Pick<Electron.App, 'getPath' | 'isPackaged' | 'setPath'>,
}));

const mkdirSyncMock = vi.fn();
vi.mock('node:fs', () => ({
  __esModule: true,
  default: {
    mkdirSync: (...a: unknown[]) => mkdirSyncMock(...a),
  },
}));

import { configureUserDataPath } from './user-data';

describe('main/lifecycle/user-data.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isPackagedMock.mockReturnValue(true);
  });

  it('keeps the default user data directory for packaged builds', () => {
    expect(configureUserDataPath()).toBe('/User/Data');
    expect(setPathMock).not.toHaveBeenCalled();
    expect(mkdirSyncMock).not.toHaveBeenCalled();
  });

  it('uses an isolated user data directory for development builds', () => {
    isPackagedMock.mockReturnValue(false);

    expect(configureUserDataPath()).toBe('/User/Data-dev');
    expect(mkdirSyncMock).toHaveBeenCalledWith('/User/Data-dev', { recursive: true });
    expect(setPathMock).toHaveBeenCalledWith('userData', '/User/Data-dev');
  });
});
