import { isLinux, isMacOS, isWindows } from './platform';

describe('shared/platform.ts', () => {
  const originalPlatform = process.platform;

  function mockPlatform(value: NodeJS.Platform) {
    Object.defineProperty(process, 'platform', {
      value,
    });
  }

  afterAll(() => {
    mockPlatform(originalPlatform as NodeJS.Platform);
  });

  it('isLinux returns true only for linux', () => {
    mockPlatform('linux');
    expect(isLinux()).toBe(true);
    mockPlatform('darwin');
    expect(isLinux()).toBe(false);
  });

  it('isMacOS returns true only for darwin', () => {
    mockPlatform('darwin');
    expect(isMacOS()).toBe(true);
    mockPlatform('win32');
    expect(isMacOS()).toBe(false);
  });

  it('isWindows returns true only for win32', () => {
    mockPlatform('win32');
    expect(isWindows()).toBe(true);
    mockPlatform('linux');
    expect(isWindows()).toBe(false);
  });
});
