import { TrayIcons } from './icons';

describe('main/icons.ts', () => {
  it('should return icon images', () => {
    expect(TrayIcons.active).toContain('assets/images/tray-active.png');

    expect(TrayIcons.activeUpdateIcon).toContain(
      'assets/images/tray-active-update.png',
    );

    expect(TrayIcons.idle).toContain('assets/images/tray-idleTemplate.png');

    expect(TrayIcons.idleUpdateIcon).toContain(
      'assets/images/tray-idle-update.png',
    );

    expect(TrayIcons.idleAlternate).toContain(
      'assets/images/tray-idle-white.png',
    );

    expect(TrayIcons.idleAlternateUpdateIcon).toContain(
      'assets/images/tray-idle-white-update.png',
    );
  });
});
