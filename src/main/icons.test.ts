import { isLinux } from '../shared/platform';

vi.mock('../shared/platform', () => ({ isLinux: vi.fn() }));

describe('main/icons.ts', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mocked(isLinux).mockReturnValue(false);
    vi.stubEnv('XDG_CURRENT_DESKTOP', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should return icon images', async () => {
    const { TrayIcons } = await import('./icons');
    expect(TrayIcons.active).toContain('assets/images/tray-active.png');

    expect(TrayIcons.idle).toContain('assets/images/tray-idleTemplate.png');

    expect(TrayIcons.idleAlternate).toContain('assets/images/tray-idle-white.png');

    expect(TrayIcons.error).toContain('assets/images/tray-error.png');

    expect(TrayIcons.offline).toContain('assets/images/tray-offline.png');
  });

  it.each([
    [true, 'GNOME', 'tray-idle-white.png'],
    [true, 'ubuntu:GNOME', 'tray-idle-white.png'],
    [true, 'GNOME-Classic:GNOME', 'tray-idle-white.png'],
    [true, 'gnome', 'tray-idle-white.png'],
    [true, 'KDE', 'tray-idleTemplate.png'],
    [true, '', 'tray-idleTemplate.png'],
    [true, 'NOT-GNOME', 'tray-idleTemplate.png'],
    [false, 'GNOME', 'tray-idleTemplate.png'],
  ])('selects the idle icon for Linux=%s and desktop=%s', async (linux, desktop, file) => {
    vi.mocked(isLinux).mockReturnValue(linux);
    vi.stubEnv('XDG_CURRENT_DESKTOP', desktop);

    const { TrayIcons } = await import('./icons');

    expect(TrayIcons.idle).toContain(`assets/images/${file}`);
    expect(TrayIcons.idleAlternate).toContain('assets/images/tray-idle-white.png');
  });
});
