import { nativeTheme } from 'electron';

import { isMacOS, isWindows } from '../shared/platform';

import { getIdleTrayIcon, TrayIcons } from './icons';

vi.mock('electron', () => ({
  nativeTheme: { shouldUseDarkColorsForSystemIntegratedUI: false, shouldUseDarkColors: false },
}));
vi.mock('../shared/platform', () => ({ isMacOS: vi.fn(), isWindows: vi.fn() }));

describe('tray icon appearance', () => {
  beforeEach(() => {
    vi.mocked(isMacOS).mockReturnValue(false);
    vi.mocked(isWindows).mockReturnValue(false);
  });

  it('uses a template only for automatic macOS appearance', () => {
    vi.mocked(isMacOS).mockReturnValue(true);
    expect(getIdleTrayIcon('auto')).toBe(TrayIcons.idle);
    expect(getIdleTrayIcon('light')).toBe(TrayIcons.light);
    expect(getIdleTrayIcon('dark')).toBe(TrayIcons.dark);
    expect(TrayIcons.dark).not.toContain('Template');
  });

  it.each([true, false])(
    'follows Windows taskbar theme, regardless of app dark mode %s',
    (appDark) => {
      vi.mocked(isWindows).mockReturnValue(true);
      Object.assign(nativeTheme, {
        shouldUseDarkColors: appDark,
        shouldUseDarkColorsForSystemIntegratedUI: true,
      });
      expect(getIdleTrayIcon('auto')).toBe(TrayIcons.light);
      Object.assign(nativeTheme, { shouldUseDarkColorsForSystemIntegratedUI: false });
      expect(getIdleTrayIcon('auto')).toBe(TrayIcons.dark);
      expect(getIdleTrayIcon('light')).toBe(TrayIcons.light);
    },
  );

  it.each(['GNOME', 'KDE', ''])(
    'uses the Linux fallback and respects overrides on %s',
    (desktop) => {
      vi.stubEnv('XDG_CURRENT_DESKTOP', desktop);
      expect(getIdleTrayIcon('auto')).toBe(TrayIcons.light);
      expect(getIdleTrayIcon('dark')).toBe(TrayIcons.dark);
      vi.unstubAllEnvs();
    },
  );
});
