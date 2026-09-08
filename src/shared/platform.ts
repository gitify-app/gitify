/**
 * Returns `true` if the current operating system is Linux.
 *
 * @returns `true` on Linux, `false` otherwise.
 */
export function isLinux(): boolean {
  return process.platform === 'linux';
}

/**
 * Returns `true` if the desktop session is GNOME Shell.
 *
 * @returns `true` under GNOME, `false` otherwise.
 */
export function isGnome(): boolean {
  return isLinux() && (process.env.XDG_CURRENT_DESKTOP ?? '').toUpperCase().includes('GNOME');
}

/**
 * Returns `true` if the current operating system is macOS.
 *
 * @returns `true` on macOS, `false` otherwise.
 */
export function isMacOS(): boolean {
  return process.platform === 'darwin';
}

/**
 * Returns `true` if the current operating system is Windows.
 *
 * @returns `true` on Windows, `false` otherwise.
 */
export function isWindows(): boolean {
  return process.platform === 'win32';
}
